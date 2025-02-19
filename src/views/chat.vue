

# chat.vue
<template>
  <main>
    <div id="chatBackground" class="chat-container px-4 py-5">
      <!-- Account Icon Dropdown -->
      <div class="d-flex justify-content-end p-3 position-fixed end-0 top-0" style="z-index: 1000;">
        <div class="dropdown">
          <button 
            class="btn rounded-circle d-flex align-items-center justify-content-center account-button" 
            type="button" 
            data-bs-toggle="dropdown" 
            aria-expanded="false"
          >
            <i class="bi bi-person-fill"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <router-link to="/userprofile" class="dropdown-item">
                Account
              </router-link>
            </li>
            <li>
              <a href="#" class="dropdown-item" @click.prevent="handleSignOut">
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Messages display area -->
      <div class="messages-area mb-4" ref="messagesContainer">
        <div v-for="(msg, index) in messages" 
             :key="index" 
             class="card mb-3"
             :class="msg.isUser ? 'ms-auto' : 'me-auto'"
             style="max-width: 70%;">
          <div class="card-header">
            {{ msg.isUser ? 'You' : 'Verdure AI' }}
          </div>
          <div class="card-body">
            <!-- Text message -->
            <div v-if="msg.type === 'text'" class="message-content">
              <p class="mb-0">{{ msg.content }}</p>
            </div>

            <!-- Image message -->
            <div v-else-if="msg.type === 'image'" class="image-message">
              <img :src="msg.content" 
                   class="img-fluid rounded" 
                   alt="Uploaded plant image">
            </div>
          </div>
        </div>
      </div>

      <!-- Input area fixed at bottom -->
      <div class="chat-input-container">
        <!-- File preview if exists -->
        <div v-if="uploadedFile" class="file-preview">
          <div class="file-preview-content">
            <span class="file-name">{{ uploadedFile.name }}</span>
            <button class="remove-file" @click="removeUpload">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <div class="input-group">
          <!-- Hidden file input -->
          <input type="file" 
                 ref="fileInput" 
                 class="d-none" 
                 accept="image/*" 
                 @change="handleFileUpload">
          
          <!-- Image upload button -->
          <button class="attach-button" @click="triggerFileUpload">
            <i class="bi bi-paperclip"></i>
          </button>

          <!-- Text input -->
          <textarea
            class="form-control chat-textarea" 
            placeholder="Ask about your plants or upload an image..." 
            v-model="userInput"
            @input="adjustTextarea"
            @keyup.enter.exact="sendMessage"
            ref="textInput"
          ></textarea>

          <!-- Send button -->
          <button class="send-button" @click="sendMessage">
            <i class="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Decorative flowers -->
    <div class="decorative-elements">
      <img src="@/assets/chatFlowers.png" 
           class="decorative-flower decorative-flower--left" 
           alt="Decorative flower">
      <img src="@/assets/chatFlowers.png" 
           class="decorative-flower decorative-flower--right" 
           alt="Decorative flower">
    </div>
  </main>
</template>

<style scoped>
main {
  min-height: 100vh;
  background-color: #341c02;
  position: relative;
  overflow-x: hidden;
}

/* Account button styling */
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

/* Messages area styling */
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

/* Chat input styling */
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

/* File preview styling */
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

/* Decorative flowers */
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

/* Responsive styles */
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

@media (max-width: 576px) {
  .messages-area {
    height: calc(100vh - 150px);
  }
  
  .card {
    max-width: 85%;
  }
}
</style>

<script>
import { ref, onMounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

export default {
  name: 'ChatView',
  
  setup() {
    const router = useRouter()
    const store = useStore()
    const fileInput = ref(null)
    const textInput = ref(null)
    const messagesContainer = ref(null)
    const messages = ref([])
    const userInput = ref('')
    const uploadedFile = ref(null)

    const adjustTextarea = () => {
      const textarea = textInput.value
      textarea.style.height = 'auto'
      textarea.style.height = textarea.scrollHeight + 'px'
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file && file.type.startsWith('image/')) {
        uploadedFile.value = {
          name: file.name,
          file: file
        }
      }
    }

    const removeUpload = () => {
      uploadedFile.value = null
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const triggerFileUpload = () => {
      fileInput.value?.click()
    }

    const sendMessage = async () => {
      if (!userInput.value.trim() && !uploadedFile.value) return

      if (uploadedFile.value) {
        messages.value.push({
          type: 'image',
          content: URL.createObjectURL(uploadedFile.value.file),
          isUser: true
        })
        removeUpload()
      }

      if (userInput.value.trim()) {
        messages.value.push({
          type: 'text',
          content: userInput.value,
          isUser: true
        })
        userInput.value = ''
        adjustTextarea()
      }

      // Scroll to bottom after new message
      await nextTick()
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }

    const handleSignOut = async () => {
      await store.dispatch('logout')
      router.push('/login')
    }

    // Auto-scroll to bottom when new messages arrive
    watch(messages, async () => {
      await nextTick()
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    })

    return {
      messages,
      userInput,
      uploadedFile,
      fileInput,
      textInput,
      messagesContainer,
      adjustTextarea,
      handleFileUpload,
      removeUpload,
      triggerFileUpload,
      sendMessage,
      handleSignOut
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