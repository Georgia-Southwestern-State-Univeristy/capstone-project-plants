

<template>
  <main>
    <div id="chatBackground" class="chat-container px-4 py-5">
      <!-- Messages display area -->
      <div class="messages-area mb-4" ref="messagesContainer">
        <div v-for="(msg, index) in messages" 
             :key="index" 
             :class="['message-card mb-4', msg.isUser ? 'user-message' : 'ai-message']">
          <div class="card">
            <div class="card-body">
              <!-- Message sender identifier -->
              <h6 class="card-subtitle mb-2" :class="msg.isUser ? 'text-end' : 'text-start'">
                {{ msg.isUser ? 'You' : 'Verdure AI' }}
              </h6>

              <!-- Text message -->
              <p v-if="msg.type === 'text'" class="card-text" v-html="msg.content"></p>

              <!-- Image message -->
              <div v-else-if="msg.type === 'image'" class="image-message">
                <img :src="msg.content" class="img-fluid rounded" alt="Uploaded plant image">
                <p v-if="msg.analysis" class="mt-3" v-html="msg.analysis"></p>
              </div>
            </div>
          </div>
        </div>
      </div>


    <div class="d-flex justify-content-end p-3 position-fixed end-0 top-0" style="z-index: 1000;">
  <div class="dropdown">
    <button 
      class="btn btn-light rounded-circle d-flex align-items-center justify-content-center" 
      type="button" 
      data-bs-toggle="dropdown" 
      aria-expanded="false"
      style="width: 40px; height: 40px; background-color: #F5E6D3;"
    >
      <i class="bi bi-person-fill" style="color: #072d13;"></i>
    </button>
    <ul class="dropdown-menu dropdown-menu-end" style="background-color: #F5E6D3;">
      <li>
        <router-link 
          to="/userprofile" 
          class="dropdown-item d-flex align-items-center"
        >
          <i class="bi bi-person me-2"></i>
          Account
        </router-link>
      </li>
      <li><hr class="dropdown-divider"></li>
      <li>
        <a 
          href="#" 
          class="dropdown-item d-flex align-items-center"
          @click.prevent="handleSignOut"
        >
          <i class="bi bi-box-arrow-right me-2"></i>
          Sign Out
        </a>
      </li>
    </ul>
  </div>
</div>

      <!-- Input area fixed at bottom -->
      <div class="chat-textarea-container">
        <!-- File preview if exists -->
        <div v-if="uploadedFile" class="file-preview mb-2">
          <div class="d-flex align-items-center bg-light p-2 rounded">
            <i class="bi bi-image me-2"></i>
            <span class="flex-grow-1">{{ uploadedFile.name }}</span>
            <button class="btn btn-sm btn-link text-danger" @click="removeUpload">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Input area -->
        <div class="input-group">
          <!-- Hidden file input -->
          <input type="file" 
                 ref="fileInput" 
                 class="d-none" 
                 accept="image/*" 
                 @change="handleFileUpload">
          
          <!-- Image upload button -->
          <button  id="imageAttachButton" class="btn btn-outline-secondary" 
                  type="button" 
                  @click="triggerFileUpload">
            <i id="imageAttachIcon" class="bi bi-paperclip"></i>
          </button>

          <!-- Text input -->
          <textarea id="textBox"
                    class="form-control chat-textarea" 
                    rows="1" 
                    placeholder="Ask about your plants or upload an image..." 
                    v-model="userInput"
                    @keyup.enter.exact="sendMessage"
                    ref="textInput"></textarea>

          <!-- Send button -->
          <button class="send-button" 
                  @click="sendMessage" 
                  :disabled="!canSendMessage">
            <svg id="sendArrow" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Decorative elements -->
    <div class="decorative-elements">
      <img src="@/assets/chatFlowers.png" 
           id="chatFlowersLeft" 
           class="decorative-flower decorative-flower--left" 
           alt="Decorative flower element" 
           loading="lazy">
      <img src="@/assets/chatFlowers.png" 
           id="chatFlowersRight" 
           class="decorative-flower decorative-flower--right" 
           alt="Decorative flower element" 
           loading="lazy">
    </div>






  </main>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useStore } from 'vuex'
import { analyzeImage, getPlantCareAdvice } from '@/services/ai'
import { useNotifications } from '@/composables/useNotifications'
import { auth } from '@/utils/firebase'
import { uploadImage } from '@/services/storage'
import { logger } from '@/services/logging'

export default {
  name: 'ChatView',
  
  setup() {
    const store = useStore()
    const { addNotification } = useNotifications()

       // Use store to save chat messages to Vuex
       const saveMessageToStore = (message) => {
        store.dispatch('sendMessage', message)
    }

    const logChatEvent = (event) => {
        logger.logInfo(`Chat event: ${event}`)
    }
    
    // Refs for DOM elements
    const messagesContainer = ref(null)
    const fileInput = ref(null)
    const textInput = ref(null)

    // State management
    const messages = ref([])
    const userInput = ref('')
    const uploadedFile = ref(null)
    const isProcessing = ref(false)

    // Computed properties
    const canSendMessage = computed(() => {
      return !isProcessing.value && (userInput.value.trim() || uploadedFile.value)
    })

    // Auto-scroll to bottom when new messages arrive
    watch(messages, async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })



  

    // Methods
    const triggerFileUpload = () => {
      fileInput.value.click()
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          uploadedFile.value = {
            name: file.name,
            file: file,
            preview: e.target.result
          }
        }
        reader.readAsDataURL(file)
      }
    }

    const removeUpload = () => {
      uploadedFile.value = null
      fileInput.value.value = ''
    }

    const sendMessage = async () => {
      if (!canSendMessage.value) return
      isProcessing.value = true

      try {
        // Handle file upload
        if (uploadedFile.value) {
          logChatEvent('Processing image upload')
                const imageUrl = await uploadImage(uploadedFile.value.file)
                
                const message = {
                    type: 'image',
                    content: uploadedFile.value.preview,
                    isUser: true,
                    timestamp: new Date()
                }

                messages.value.push(message)
                saveMessageToStore(message)


          // Get AI analysis
          const analysis = await analyzeImage(imageUrl)
          messages.value.push({
            type: 'text',
            content: analysis,
            isUser: false,
            timestamp: new Date()
          })

          removeUpload()
        } 
        // Handle text message
        else if (userInput.value.trim()) {
          messages.value.push({
            type: 'text',
            content: userInput.value,
            isUser: true,
            timestamp: new Date()
          })

          const response = await getPlantCareAdvice(userInput.value)
          messages.value.push({
            type: 'text',
            content: response,
            isUser: false,
            timestamp: new Date()
          })

          userInput.value = ''
        }
      } catch (error) {
            logger.logError('Error in chat:', error)
            addNotification('An error occurred while processing your message', 'error')
      } finally {
        isProcessing.value = false
      }
    }



    onMounted(() => {
      // Load chat history if user is authenticated
      if (auth.currentUser) {
        // Load chat history from Firestore
      }
    })

    /*
    const handleSignOut = async () => {
      try {
        await auth.signOut()
        router.push('/login')
      } catch (error) {
        console.error('Error signing out:', error)
      }
*/
    return {
        messages,
        userInput,
        uploadedFile,
        fileInput,
        textInput,
        messagesContainer,
        canSendMessage,
        triggerFileUpload,
        handleFileUpload,
        removeUpload,
        sendMessage
    }
  }
}
</script>

<style>
@import '@/assets/styles/generalStyle.css';

</style>


<style scoped>

main {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
  background-color: #341c02;  /* Your brown color */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.dropdown-item {
  color: #072d13;
  padding: 8px 16px;
}

.dropdown-item:hover {
  background-color: rgba(7, 45, 19, 0.1);
}

.dropdown-menu {
  min-width: 200px;
  padding: 8px 0;
  margin-top: 8px;
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dropdown-divider {
  border-top-color: #072d13;
  opacity: 0.1;
}


body#chatBackground {
    background-color: #341c02;

 }

/* Claude AI textarea CSS */
 textarea#textBox {
  width: 100%;
  max-width: 800px;
  min-height: 120px;
  padding: 1rem 4rem 1rem 1rem;
  margin: 0 auto;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  font-size: clamp(14px, 2vw, 16px);
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  
  
}

/* Claude AI textarea CSS */
.chat-textarea:focus {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: #341c02;
  outline: none;
}

/* Claude AI textarea media queries */
@media (max-width: 768px) {
  .chat-textarea {
      min-height: 100px;
      padding: 0.75rem;
  }
}




/* Claude AI flower class class */
.decorative-elements {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  pointer-events: none;
}

.decorative-flower {
  position: absolute;
  bottom: clamp(10px, 3vw, 20px);
  width: clamp(120px, 20vw, 220px);
  height: auto;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.decorative-flower--left {
  left: clamp(10px, 3vw, 20px);
}

.decorative-flower--right {
  right: clamp(10px, 3vw, 20px);
  transform: scaleX(-1);
}

@media (max-width: 640px) {
  .decorative-flower {
      opacity: 0.5;
      width: clamp(80px, 15vw, 120px);
  }
}

@media (max-height: 600px) {
  .decorative-flower {
      display: none;
  }
}


/* Handle foldable devices */
@media (max-width: 320px) {
  .chat-container {
      padding: 0.5rem;
  }
  
  .chat-label {
      font-size: 14px;
  }
}

/* Ultra-wide screen support */
@media (min-width: 2000px) {
  .chat-container {
      max-width: 1800px;
      margin: 0 auto;
  }
}

/* Claude AI chat container and label CSS */
.chat-container {
  min-height: 100vh;
  background: var(--chat-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(1rem, 5vw, 3rem);

}

.chat-label {
  color: var(--chat-text);
  font-size: clamp(16px, 2.5vw, 20px);
  font-weight: 500;
  letter-spacing: -0.01em;
}

/* Claude AI arrow send button CSS */



 .send-button {
  position: fixed;
  bottom: 3rem;
  right: calc(50% - 380px); /* Positions relative to textarea */
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  z-index: 1001;
  transition: transform 0.2s ease;
 }
 
 svg#sendArrow {
  width: 1.5rem;
  height: 1.5rem;
  fill: #341c02;
 }
 
 .send-button:active {
  transform: scale(0.9);
 }

 /* Image attach */

 
button#imageAttachButton {
  position: fixed;
  bottom: 3rem;
  right: calc(50% - 340px); /* Positions relative to textarea */
  background: none;
border: none;
  padding: 0.5rem;
  cursor: pointer;
  z-index: 1001;
}

i#ImageAttachIcon {

fill: #341c02;

}

 
 /* Mobile adjustments */
 @media (max-width: 768px) {
  .send-button {
    bottom: 0.75rem;
    right: 0.75rem;
  }
  
  svg#sendArrow {
    width: 1.25rem;
    height: 1.25rem;
  }
 }

 @media (max-width: 840px) {
  .send-button {
    right: 1rem;
  }
  
  button#imageAttachButton {
    right: 3.5rem;
  }
}

</style>