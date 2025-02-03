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
          <button class="btn btn-outline-secondary" 
                  type="button" 
                  @click="triggerFileUpload">
            <i class="bi bi-paperclip"></i>
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
            <svg viewBox="0 0 24 24">
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

<style scoped>
@import '@/assets/styles/chatStyle.css';
@import '@/assets/styles/generalStyle.css';
</style>