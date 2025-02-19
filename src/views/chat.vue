

<template>
  <main class="h-screen bg-[#341c02] relative overflow-x-hidden">
    <!-- Account Icon Dropdown -->
    <div class="fixed top-4 right-4 z-50">
      <div class="dropdown">
        <button 
          class="w-10 h-10 rounded-full bg-[#F5E6D3] flex items-center justify-center"
          type="button" 
          data-bs-toggle="dropdown" 
          aria-expanded="false"
        >
          <i class="bi bi-person-fill text-[#341c02]"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end bg-[#F5E6D3] border-none shadow-lg">
          <li>
            <router-link to="/userprofile" class="dropdown-item text-[#341c02] px-4 py-2 hover:bg-opacity-10 hover:bg-[#341c02]">
              Account
            </router-link>
          </li>
          <li>
            <a @click.prevent="handleSignOut" href="#" class="dropdown-item text-[#341c02] px-4 py-2 hover:bg-opacity-10 hover:bg-[#341c02]">
              Sign Out
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Messages Area -->
    <div ref="messagesContainer" class="messages-area h-[calc(100vh-180px)] overflow-y-auto p-4 bg-[#341c02]">
      <div 
        v-for="message in chatStore.messages" 
        :key="message.id" 
        class="mb-3"
        :class="message.isUser ? 'ml-auto' : 'mr-auto'"
        style="max-width: 70%;"
      >
        <div class="card bg-[#F5E6D3] border-0">
          <div class="card-header bg-opacity-10 bg-[#341c02] text-[#341c02] font-bold">
            {{ message.isUser ? 'You' : 'Verdure AI' }}
          </div>
          <div class="card-body text-[#341c02]">
            <!-- Image message -->
            <div v-if="message.type === 'image'" class="mb-2">
              <img 
                :src="message.content" 
                class="img-fluid rounded" 
                alt="Uploaded image"
              >
            </div>
            <!-- Text message -->
            <div v-if="message.type === 'text'" class="message-content">
              <p class="mb-0">{{ message.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="fixed bottom-0 left-0 right-0 p-4 bg-[#341c02]">
      <!-- File Preview -->
      <div v-if="uploadedFile" class="file-preview absolute bottom-full left-14 bg-[#F5E6D3] bg-opacity-90 rounded px-3 py-1 mb-2">
        <div class="flex items-center gap-2">
          <span class="text-[#341c02]">{{ uploadedFile.name }}</span>
          <button @click="removeUpload" class="text-[#341c02] hover:opacity-75">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>

      <div class="input-group max-w-3xl mx-auto flex items-end gap-2">
        <!-- Camera Button -->
        <button @click="openCamera" class="w-11 h-11 rounded-lg bg-[#341c02] flex items-center justify-center">
          <i class="bi bi-camera text-white text-xl"></i>
        </button>

        <!-- Hidden file input -->
        <input 
          type="file" 
          ref="fileInput" 
          class="hidden" 
          accept="image/*" 
          @change="handleFileUpload"
        >
        
        <!-- Attachment Button -->
        <button @click="triggerFileUpload" class="w-11 h-11 rounded-lg bg-[#341c02] flex items-center justify-center">
          <i class="bi bi-paperclip text-white text-xl"></i>
        </button>

        <!-- Text Input -->
        <textarea
          class="form-control resize-none min-h-[44px] max-h-[200px] rounded-lg py-3 px-4 bg-white text-[#341c02]"
          placeholder="Ask about your plants or upload an image..."
          v-model="userInput"
          @input="adjustTextarea"
          @keyup.enter.exact="sendMessage"
          ref="textInput"
        ></textarea>

        <!-- Send Button -->
        <button 
          @click="sendMessage" 
          class="w-11 h-11 rounded-lg bg-[#341c02] flex items-center justify-center transform active:scale-90 transition-transform"
        >
          <i class="bi bi-send-fill text-white text-xl"></i>
        </button>
      </div>
    </div>

    <!-- Decorative Flowers -->
    <div class="fixed bottom-0 left-0 right-0 pointer-events-none">
      <img 
        src="@/assets/chatFlowers.png" 
        class="absolute bottom-8 left-8 w-48 h-auto opacity-80 md:block hidden"
        alt="Left decorative flower"
      >
      <img 
        src="@/assets/chatFlowers.png" 
        class="absolute bottom-8 right-8 w-48 h-auto opacity-80 transform scale-x-[-1] md:block hidden"
        alt="Right decorative flower"
      >
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '@/store/chatStore'
import { useAuthStore } from '@/store/authStore'

const router = useRouter()
const chatStore = useChatStore()
const authStore = useAuthStore()

const fileInput = ref(null)
const textInput = ref(null)
const messagesContainer = ref(null)
const userInput = ref('')
const uploadedFile = ref(null)

// Adjust textarea height based on content
const adjustTextarea = () => {
  const textarea = textInput.value
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

// Handle file upload
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    uploadedFile.value = {
      name: file.name,
      file: file
    }
  }
}

// Remove uploaded file
const removeUpload = () => {
  uploadedFile.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// Trigger file input click
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// Open camera
const openCamera = () => {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        // Handle camera stream
        // Add your camera handling logic here
      })
      .catch(err => {
        console.error('Camera error:', err)
      })
  }
}

// Send message
const sendMessage = async () => {
  if (!userInput.value.trim() && !uploadedFile.value) return

  if (uploadedFile.value) {
    await chatStore.sendMessage({
      type: 'image',
      content: URL.createObjectURL(uploadedFile.value.file),
      isUser: true,
      timestamp: new Date()
    })
    removeUpload()
  }

  if (userInput.value.trim()) {
    await chatStore.sendMessage({
      type: 'text',
      content: userInput.value,
      isUser: true,
      timestamp: new Date()
    })
    userInput.value = ''
    adjustTextarea()
  }

  // Scroll to bottom after new message
  await nextTick()
  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
}

// Handle sign out
const handleSignOut = async () => {
  await authStore.logout()
  router.push('/login')
}

// Auto-scroll to bottom when new messages arrive
watch(() => chatStore.messages, async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}, { deep: true })

// Load chat history on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await chatStore.loadChatHistory(authStore.user.uid)
  }
})
</script>

<style>
@import '@/assets/styles/generalStyle.css';

</style>

<style scoped>




main {
  min-height: 100vh;
  background-color: #341c02;
  position: relative;
  overflow-x: hidden;
}

.account-button {
  width: 40px;
  height: 40px;
  background-color: #F5E6D3;
}

.account-button i {
  color: #341c02;
}

.dropdown-menu {
  background-color: #F5E6D3;
  border: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dropdown-item {
  color: #341c02;
  padding: 8px 16px;
}

.dropdown-item:hover {
  background-color: rgba(52, 28, 2, 0.1);
}

.messages-area {
  height: calc(100vh - 180px);
  overflow-y: auto;
  padding: 1rem;
}

.card {
  background-color: #F5E6D3;
  border: none;
}

.card-header {
  background-color: rgba(52, 28, 2, 0.1);
  color: #341c02;
  font-weight: bold;
}

.card-body {
  color: #341c02;
}

.chat-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background-color: #341c02;
}

.input-group {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.chat-textarea {
  resize: none;
  min-height: 44px;
  max-height: 200px;
  border-radius: 8px;
  padding: 0.75rem;
  background-color: white;
  color: #341c02;
}

.attach-button, .send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background-color: #341c02;
  display: flex;
  align-items: center;
  justify-content: center;
}

.attach-button i, .send-button i {
  color: white;
  font-size: 1.25rem;
}

.file-preview {
  position: absolute;
  bottom: 100%;
  left: 58px;
  background-color: rgba(245, 230, 211, 0.9);
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 0.5rem;
}

.file-preview-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.file-name {
  color: #341c02;
}

.remove-file {
  background: none;
  border: none;
  color: #341c02;
  padding: 0;
  display: flex;
  align-items: center;
}

.decorative-elements {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.decorative-flower {
  position: absolute;
  bottom: 2rem;
  width: 200px;
  height: auto;
  opacity: 0.8;
}

.decorative-flower--left {
  left: 2rem;
}

.decorative-flower--right {
  right: 2rem;
  transform: scaleX(-1);
}

@media (max-width: 768px) {
  .decorative-flower {
    display: none;
  }
  
  .input-group {
    padding: 0 0.5rem;
  }
  
  .chat-textarea {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .messages-area {
    height: calc(100vh - 150px);
  }
  
  .card {
    max-width: 85%;
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