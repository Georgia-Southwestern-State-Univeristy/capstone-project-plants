

<template>
  <main>
    <div id="chatBackground" class="chat-container px-4 py-5">
      <!-- Messages display area -->
<div class="messages-area mb-4" ref="messagesContainer">
  <div v-for="(msg, index) in messages" 
       :key="index" 
       class="message-wrapper"
       :class="msg.isUser ? 'justify-content-end' : 'justify-content-start'">
    
    <!-- Message card with dynamic styling -->
    <div class="message-bubble" :class="msg.isUser ? 'user-message' : 'ai-message'">
      <!-- Text message -->
      <div v-if="msg.type === 'text'" 
           class="message-content"
           :class="{ 'typing': !msg.isUser && isTyping }">
        <p class="mb-0" v-html="msg.content"></p>
      </div>

      <!-- Image message -->
      <div v-else-if="msg.type === 'image'" class="image-message">
        <img :src="msg.content" 
             class="uploaded-image" 
             alt="Uploaded plant image">
        <p v-if="msg.analysis" 
           class="mt-2 mb-0" 
           v-html="msg.analysis"></p>
      </div>

      <!-- Timestamp -->
      <small class="message-time">
        {{ new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
      </small>
    </div>
  </div>

  <!-- Typing indicator for AI -->
  <div v-if="isTyping" class="message-wrapper justify-content-start">
    <div class="message-bubble ai-message typing-indicator">
      <span></span>
      <span></span>
      <span></span>
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
       <!-- File upload preview -->
<div v-if="uploadedFile" class="file-preview">
  <div class="file-preview-content">
    <i class="bi bi-image me-2"></i>
    <span class="file-name">{{ uploadedFile.name }}</span>
    <button class="remove-file" @click="removeUpload">
      <i class="bi bi-x"></i>
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
import { useNotifications } from '@/composables/useNotifications'
import { auth } from '../utils/firebase'

export default {
  name: 'ChatView',

  setup() {
    const store = useStore()
    const { showNotification } = useNotifications()

    // Refs for DOM elements and state
    const messagesContainer = ref(null)
    const fileInput = ref(null)
    const textInput = ref(null)
    const messages = ref([])
    const userInput = ref('')
    const uploadedFile = ref(null)
    const isProcessing = ref(false)
    const isTyping = ref(false)

    // Helper function to simulate AI typing
    const simulateTyping = async (message) => {
      isTyping.value = true
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
      isTyping.value = false
      return message
    }

    // Fetch plant care advice from backend API
    const processPlantQuery = async (query) => {
      try {
        const response = await fetch('/api/get-plant-care-advice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        })
        const data = await response.json()
        return data.naturalResponse || data
      } catch (error) {
        console.error('Error processing plant query:', error)
        return "I'm having trouble getting that information right now. Could you try rephrasing your question?"
      }
    }

    // Handle image analysis via backend API
    const handleImageAnalysis = async (file) => {
      try {
        isProcessing.value = true

        // Add user's image message
        messages.value.push({
          type: 'image',
          content: URL.createObjectURL(file),
          isUser: true,
          timestamp: new Date()
        })

        // Upload image via backend API
        const formData = new FormData()
        formData.append('image', file)

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData
        })
        const uploadData = await uploadResponse.json()
        const imageUrl = uploadData.imageUrl

        // Get analysis using the uploaded image URL
        const analysisResponse = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl })
        })
        const analysis = await analysisResponse.json()

        // Add AI's response messages
        messages.value.push({
          type: 'text',
          content: await simulateTyping(analysis.naturalResponse),
          isUser: false,
          timestamp: new Date()
        })

        if (analysis.analysis && analysis.analysis.careInstructions) {
          messages.value.push({
            type: 'text',
            content: await simulateTyping("Here are some care instructions: " + analysis.analysis.careInstructions),
            isUser: false,
            timestamp: new Date()
          })
        }

        // Save to store
        store.dispatch('sendMessage', {
          type: 'analysis',
          content: analysis,
          timestamp: new Date()
        })

      } catch (error) {
        console.error('Error in image analysis:', error)
        messages.value.push({
          type: 'text',
          content: "I'm sorry, I had trouble analyzing that image. Please make sure it's a clear photo of a plant.",
          isUser: false,
          timestamp: new Date()
        })
      } finally {
        isProcessing.value = false
      }
    }

    // Send message function
    const sendMessage = async () => {
      if (!canSendMessage.value) return
      isProcessing.value = true

      try {
        if (uploadedFile.value) {
          await handleImageAnalysis(uploadedFile.value.file)
          removeUpload()
        } else if (userInput.value.trim()) {
          // Add user message
          const userMessage = {
            type: 'text',
            content: userInput.value,
            isUser: true,
            timestamp: new Date()
          }
          messages.value.push(userMessage)
          store.dispatch('sendMessage', userMessage)

          // Process query and get AI response
          const response = await processPlantQuery(userInput.value)

          // Add AI response
          const aiMessage = {
            type: 'text',
            content: await simulateTyping(response),
            isUser: false,
            timestamp: new Date()
          }
          messages.value.push(aiMessage)
          store.dispatch('sendMessage', aiMessage)

          userInput.value = ''
        }
      } catch (error) {
        console.error('Error in chat:', error)
        showNotification('An error occurred while processing your message', 'error')
      } finally {
        isProcessing.value = false
      }
    }

    // File handling functions
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

    // Load chat history on mount
    onMounted(() => {
      if (auth.currentUser) {
        store.dispatch('loadChatHistory', auth.currentUser.uid)
          .then((history) => {
            messages.value = history
          })
          .catch((error) => {
            console.error('Error loading chat history:', error)
          })
      }
    })

    return {
      messages,
      userInput,
      uploadedFile,
      fileInput,
      textInput,
      messagesContainer,
      canSendMessage,
      isTyping,
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

/* Message container styles */
.messages-area {
  height: calc(100vh - 180px);
  overflow-y: auto;
  padding: 1rem;
  background-color: #341c02;
}

.message-wrapper {
  display: flex;
  margin-bottom: 1rem;
  animation: fadeIn 0.3s ease-in-out;
}

/* Message bubble styles */
.message-bubble {
  max-width: 70%;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-message {
  background-color: #F5E6D3; /* Cream color */
  color: #341c02;
  border-top-right-radius: 0.2rem;
  margin-left: auto;
}

.ai-message {
  background-color: #FFF8F0; /* Lighter cream */
  color: #341c02;
  border-top-left-radius: 0.2rem;
  margin-right: auto;
}

/* Message content styles */
.message-content {
  word-wrap: break-word;
  font-size: 0.95rem;
  line-height: 1.4;
}

/* Image message styles */
.image-message {
  width: 100%;
}

.uploaded-image {
  max-width: 100%;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

/* Timestamp styles */
.message-time {
  display: block;
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.25rem;
  opacity: 0.8;
}

/* File preview styles */
.file-preview {
  position: absolute;
  bottom: 70px;
  left: 0;
  right: 0;
  background-color: rgba(255, 248, 240, 0.95);
  padding: 0.5rem 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.file-preview-content {
  display: flex;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
}

.file-name {
  flex-grow: 1;
  margin-right: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file {
  background: none;
  border: none;
  color: #341c02;
  padding: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.remove-file:hover {
  opacity: 1;
}

/* Typing indicator animation */
.typing-indicator {
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background-color: #341c02;
  border-radius: 50%;
  margin: 0 2px;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Scrollbar styling */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: rgba(255, 248, 240, 0.1);
}

.messages-area::-webkit-scrollbar-thumb {
  background-color: rgba(52, 28, 2, 0.3);
  border-radius: 3px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
  
  .messages-area {
    height: calc(100vh - 160px);
  }
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