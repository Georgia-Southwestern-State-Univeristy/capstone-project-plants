<!--
<template>
    <main>
      <div id="chatBackground">
        <div class="messages-container">
      <MessageDisplay 
        v-for="msg in messages" 
        :key="msg.timestamp"
        :message="msg.content"
        :type="msg.type"
      />
    </div>
        <div class="chat-container px-4 py-5">
          <div class="form-group">
            <div class="chat-textarea-container">
              <textarea 
                id="textBox" 
                class="form-control chat-textarea" 
                rows="4" 
                placeholder="What do you need help with?"
                aria-label="Chat message input"
                v-model="message"
                @keyup.enter="sendMessage"
              ></textarea>
              <button 
                class="send-button" 
                aria-label="Send message"
                @click="sendMessage"
              >
                <svg viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
  
        <div class="decorative-elements">
          <img 
            src="@/assets/chatFlowers.png" 
            id="chatFlowersLeft" 
            class="decorative-flower decorative-flower--left" 
            alt="Decorative flower element" 
            loading="lazy"
          >
          <img 
            src="@/assets/chatFlowers.png" 
            id="chatFlowersRight" 
            class="decorative-flower decorative-flower--right" 
            alt="Decorative flower element" 
            loading="lazy"
          >
        </div>
      </div>
    </main>
  </template>
  
  <script>
// chat.vue script section
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { analyzeImage, getPlantCareAdvice } from '@/services/ai';
import { cache } from '@/services/cache';
import { logger } from '@/services/logging';

export default {
  name: 'ChatView',
  setup() {
    const store = useStore();
    const message = ref('');
    const messages = ref([]);
    const isProcessing = ref(false);
    const imageFile = ref(null);

    // Handle text messages
    const sendMessage = async () => {
      if (!message.value.trim() && !imageFile.value) return;

      try {
        isProcessing.value = true;
        
        // Add user message to chat
        const userMessage = {
          type: 'user',
          content: message.value,
          timestamp: new Date()
        };
        messages.value.push(userMessage);

        let response;
        if (imageFile.value) {
          // Handle image analysis
          response = await analyzeImage(imageFile.value);
          
          // Cache the analysis result
          await cache.set(`analysis_${Date.now()}`, response);
          
          // Log the analysis for monitoring
          await logger.logInfo({
            type: 'image_analysis',
            imageId: imageFile.value.name
          });
        } else {
          // Handle text-based plant care advice
          response = await getPlantCareAdvice(message.value);
        }

        // Add AI response to chat
        messages.value.push({
          type: 'ai',
          content: response,
          timestamp: new Date()
        });

        // Clear inputs after sending
        message.value = '';
        imageFile.value = null;

      } catch (error) {
        await logger.logError(error);
        messages.value.push({
          type: 'error',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        });
      } finally {
        isProcessing.value = false;
      }
    };

    // Handle image uploads
    const handleImageUpload = (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith('image/')) {
        imageFile.value = file;
        message.value = `Analyzing image: ${file.name}`;
        sendMessage();
      }
    };

    // Load chat history on mount
    onMounted(async () => {
      const userId = store.state.user?.uid;
      if (userId) {
        const cachedMessages = await cache.get(`chat_${userId}`);
        if (cachedMessages) {
          messages.value = JSON.parse(cachedMessages);
        }
      }
    });

    return {
      message,
      messages,
      isProcessing,
      sendMessage,
      handleImageUpload
    };
  }
}
</script>
  
  <style scoped>
  #chatBackground {
    background-color: #341c02;
  }
  
  .chat-textarea {
    width: 100%;
    max-width: 800px;
    min-height: 120px;
    padding: 1rem;
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
  
  .chat-textarea:focus {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-color: #341c02;
    outline: none;
  }
  
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
  
  .send-button {
    position: absolute;
    bottom: 2rem;
    right: 25rem;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .send-button svg {
    width: 1.5rem;
    height: 1.5rem;
    fill: #341c02;
  }
  
  .send-button:active {
    transform: scale(0.9);
  }
  
  @media (max-width: 768px) {
    .decorative-flower {
      opacity: 0.5;
      width: clamp(80px, 15vw, 120px);
    }
    
    .send-button {
      bottom: 0.75rem;
      right: 0.75rem;
    }
    
    .send-button svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }
  
  @media (max-height: 600px) {
    .decorative-flower {
      display: none;
    }
  }
  
  /* Additional responsive styles */
  @media (max-width: 320px) {
    .chat-container {
      padding: 0.5rem;
    }
  }
  
  @media (min-width: 2000px) {
    .chat-container {
      max-width: 1800px;
      margin: 0 auto;
    }
  }
  </style>

<style scoped>
/* Import original CSS */
@import '@/assets/styles/chatStyle.css';
@import '@/assets/styles/genera;Style.css';
</style>
-->
# chat.vue
<template>
  <main>
    <!-- Main chat area container -->
    <div class="chat-container px-4 py-5">
      <!-- Messages display area with scrolling -->
      <div class="messages-area mb-4" ref="messagesContainer">
        <!-- Iterate through each message in the chat history -->
        <div v-for="(msg, index) in messages" :key="index" 
             :class="['message-card mb-4', msg.isUser ? 'user-message' : 'ai-message']">
          
          <!-- Bootstrap card for each message -->
          <div class="card">
            <div class="card-body">
              <!-- Show user/AI identifier -->
              <h6 class="card-subtitle mb-2" :class="msg.isUser ? 'text-end' : 'text-start'">
                {{ msg.isUser ? 'You' : 'Verdure AI' }}
              </h6>

              <!-- Handle text messages -->
              <p v-if="msg.type === 'text'" class="card-text" v-html="msg.content"></p>

              <!-- Handle image messages -->
              <div v-else-if="msg.type === 'image'" class="image-message">
                <img :src="msg.content" class="img-fluid rounded" alt="Uploaded plant image">
                <!-- AI's analysis response will appear below the image -->
                <p v-if="msg.analysis" class="mt-3" v-html="msg.analysis"></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Input area fixed at bottom -->
      <div class="input-container">
        <!-- Show uploaded file preview if exists -->
        <div v-if="uploadedFile" class="file-preview mb-2">
          <div class="d-flex align-items-center bg-light p-2 rounded">
            <i class="bi bi-file-image me-2"></i>
            <span class="flex-grow-1">{{ uploadedFile.name }}</span>
            <button class="btn btn-sm btn-link text-danger" @click="removeUpload">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Input group for text and controls -->
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
            <i class="bi bi-image"></i>
          </button>

          <!-- Text input area -->
          <textarea class="form-control" 
                    rows="1" 
                    placeholder="Ask about your plants or upload an image..." 
                    v-model="userInput"
                    @keyup.enter.exact="sendMessage"
                    ref="textInput"></textarea>

          <!-- Send button -->
          <button class="btn btn-success" 
                  type="button" 
                  @click="sendMessage" 
                  :disabled="!canSendMessage">
            <i class="bi bi-send"></i>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { analyzeImage, getPlantCareAdvice } from '@/services/ai'

export default {
  name: 'ChatView',
  setup() {
    // Refs for template elements
    const messagesContainer = ref(null)
    const fileInput = ref(null)
    const textInput = ref(null)

    // State management
    const messages = ref([])
    const userInput = ref('')
    const uploadedFile = ref(null)
    const isProcessing = ref(false)

    // Computed property to control when messages can be sent
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

    // Handle file upload button click
    const triggerFileUpload = () => {
      fileInput.value.click()
    }

    // Process the uploaded file
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        uploadedFile.value = file
        // Create preview URL for the image
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

    // Remove uploaded file
    const removeUpload = () => {
      uploadedFile.value = null
      fileInput.value.value = '' // Reset file input
    }

    // Send message or image to AI
    const sendMessage = async () => {
      if (!canSendMessage.value) return

      isProcessing.value = true

      try {
        if (uploadedFile.value) {
          // Handle image upload
          const imageMessage = {
            type: 'image',
            content: uploadedFile.value.preview,
            isUser: true
          }
          messages.value.push(imageMessage)

          // Get AI analysis
          const analysis = await analyzeImage(uploadedFile.value.file)
          
          // Add AI response
          messages.value.push({
            type: 'text',
            content: analysis,
            isUser: false
          })

          removeUpload()
        } else if (userInput.value.trim()) {
          // Handle text message
          messages.value.push({
            type: 'text',
            content: userInput.value,
            isUser: true
          })

          // Get AI response
          const response = await getPlantCareAdvice(userInput.value)
          messages.value.push({
            type: 'text',
            content: response,
            isUser: false
          })

          userInput.value = ''
        }
      } catch (error) {
        console.error('Error processing message:', error)
        messages.value.push({
          type: 'text',
          content: 'Sorry, I encountered an error. Please try again.',
          isUser: false
        })
      } finally {
        isProcessing.value = false
      }
    }

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
/* Chat container styles */
.chat-container {
  height: calc(100vh - 76px);
  display: flex;
  flex-direction: column;
  background-color: #341c02;
}

/* Messages area styles */
.messages-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Message card styles */
.message-card {
  max-width: 80%;
}

.user-message {
  margin-left: auto;
}

.ai-message {
  margin-right: auto;
}

/* Input container styles */
.input-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 1rem;
  margin-top: auto;
}

/* File preview styles */
.file-preview {
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* Custom scrollbar for messages area */
.messages-area::-webkit-scrollbar {
  width: 6px;
}

.messages-area::-webkit-scrollbar-track {
  background: transparent;
}

.messages-area::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

@import '@/assets/styles/generalStyle.css';
</style>

