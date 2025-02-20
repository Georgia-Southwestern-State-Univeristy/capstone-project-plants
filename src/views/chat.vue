<template>
  <main>
    <div id="chatBackground" class="chat-container px-4 py-5">
      <!-- Account Icon Dropdown -->
      <div class="d-flex justify-content-end p-3 position-fixed end-0 top-0" style="z-index: 1000;">
        <div class="dropdown">
          <button 
            class="account-circle"
            type="button" 
            @click="toggleDropdown"
          >
            <i class="bi bi-person-fill"></i>
          </button>
          <ul class="account-dropdown" :class="{ 'show': isDropdownOpen }">
            <li><router-link to="/userprofile" class="dropdown-item">Account</router-link></li>
            <li><a href="#" class="dropdown-item" @click.prevent="handleSignOut">Sign Out</a></li>
          </ul>
        </div>
      </div>

      <!-- Messages display area -->
      <!-- Messages display area -->
<div class="messages-area mb-4" ref="messagesContainer">
  <div v-for="msg in chatStore.messages" 
       :key="msg.id" 
       class="card mb-3"
       :class="[
         msg.isUser ? 'me-auto user-message' : 'ms-auto ai-message',
         'message-card'
       ]"
       style="max-width: 70%;">
    <div class="card-header" :class="msg.isUser ? 'user-header' : 'ai-header'">
      {{ msg.isUser ? 'You' : 'Verdure AI' }}
    </div>
    <div class="card-body">
      <!-- Text message -->
      <div v-if="msg.type === 'text'" class="message-content">
        <p class="mb-0" :class="msg.isUser ? 'user-text' : 'ai-text'">
          {{ msg.content }}
        </p>
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
        <TransitionGroup 
          name="file-preview"
          tag="div"
        class="file-previews-container"
>
          <div 
    v-for="file in uploadedFiles" 
    :key="file.id"
    class="file-preview"
  >
    <div class="file-preview-content">
      <span class="file-name">{{ file.name }}</span>
      <button class="remove-file" @click="() => removeUpload(file.id)">
        <i class="bi bi-x"></i>
      </button>
    </div>
  </div>
</TransitionGroup>

        <div class="input-group">
          <!-- Hidden file inputs -->
          <input 
            type="file" 
            ref="fileInput" 
            class="d-none" 
            accept="image/*" 
            @change="handleFileUpload"
          />

 
        
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
  </main>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { Transition } from 'vue';



// Store and router setup
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

// Refs for DOM elements
const fileInput = ref(null);
const textInput = ref(null);
const messagesContainer = ref(null);


// State refs
const userInput = ref('');
// Change from single file to array
const uploadedFiles = ref([]);
const isDropdownOpen = ref(false);




// Text input handling
const adjustTextarea = () => {
  const textarea = textInput.value;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

// File handling
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    uploadedFiles.value.push({
      id: Date.now(), // Add unique id for transition
      name: file.name,
      file: file
    });
  }
};

const removeUpload = (id) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== id);
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

// Message handling
const sendMessage = async () => {
  if (!uploadedFiles.value.length && !userInput.value.trim()) return;

  // Send text message if there is text input
  if (userInput.value.trim()) {
    chatStore.sendMessage({  // Use sendMessage instead of addMessage
      id: Date.now(),
      type: 'text',
      content: userInput.value,
      isUser: true,
      timestamp: new Date()
    });
    userInput.value = '';
    adjustTextarea();
  }

  // Send image messages if there are uploaded files
  for (const uploadedFile of uploadedFiles.value) {
    chatStore.sendMessage({  // Use sendMessage instead of addMessage
      id: Date.now() + Math.random(),
      type: 'image',
      content: URL.createObjectURL(uploadedFile.file),
      isUser: true,
      timestamp: new Date()
    });
  }
  uploadedFiles.value = []; // Clear files after sending

  await nextTick();
  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
};


// Authentication
const handleSignOut = async () => {
  await authStore.logout();
  router.push('/login');
};

// Dropdown handling
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Lifecycle hooks
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await chatStore.loadChatHistory(authStore.user.uid);
  }

  document.addEventListener('click', (event) => {
    const dropdown = document.querySelector('.dropdown');
    if (!dropdown.contains(event.target)) {
      isDropdownOpen.value = false;
    }
  });
});


// Watch for new messages
watch(() => chatStore.messages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}, { deep: true });





</script>

<style scoped>




.account-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #F5E6D3;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.account-circle i {
  color: #341c02;
  font-size: 1.2rem;
}

.account-dropdown {
  background-color: #F5E6D3;
  border: none;
  border-radius: 16px;
  padding: 0.75rem 0;
  margin-top: 0.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  list-style: none;
  display: none;
  position: absolute;
  right: 0;
  min-width: 160px;
}

.dropdown-item {
  color: #341c02;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  display: block;
  font-weight: 700;
  transition: background-color 0.2s;
}

.account-dropdown.show {
  display: block;
}

.chat-container {
  min-height: 100vh;
  background-color: #341c02;
  position: relative;
  overflow-x: hidden;
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


.attach-button,
.send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background-color: #341c02;
  display: flex;
  align-items: center;
  justify-content: center;
}


.send-button i {
  color: #F5E6D3;
}

.attach-button i {
  color:#F5E6D3;
}

.send-button {
  transform: scale(1);
  transition: transform 0.2s;
}

.send-button:active {
  transform: scale(0.9);
}

.file-previews-container {
  position: absolute;
  bottom: 100%;
  left: 58px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-preview {
  background-color: #F5E6D3;
  border: 2px solid #341c02;
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease-out;

}

.file-preview-enter-active,
.file-preview-leave-active {
  transition: all 0.3s ease-out;
}

.file-preview-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.file-preview-leave-to {
  opacity: 0;
  transform: translateY(20px); /* Changed from -20px to 20px for sliding down */
}

.file-preview-move {
  transition: transform 0.3s ease-out;
}

.file-preview-content {
  display: flex;
  align-items: center;
  justify-content: space-between; /* This will push the X to the right */
  gap: 0.5rem;
  width: 100%; /* Ensure it takes full width */
}

.file-name {
  color: #341c02;
  font-weight: bold;
  margin: 0;
}

.remove-file {
  background: none;
  border: none;
  color: #341c02;
  padding: 0;
  display: flex;
  align-items: center;
  cursor: pointer;
}


.message-card {
  width: 70%;
  margin-bottom: 15px;
  border: none;
}

.messages-area {
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 20px;
  margin-bottom: 100px; /* Space for input area */
  display: flex;
  flex-direction: column;
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

.user-message {
  margin-left: 0 !important;
  margin-right: auto !important;
  background-color: #F5E6D3;
  align-self: flex-start;
}

.ai-message {
  margin-right: 0 !important;
  margin-left: auto !important;
  background-color: #F5E6D3;
  align-self: flex-end;
}

.user-header {
  background-color: #341c02;
  color: #F5E6D3;
  font-weight: bold;
}

.ai-header {
  background-color: #341c02;
  color: #F5E6D3;
  font-weight: bold;
}

.user-text {
  color: #341c02;
}

.ai-text {
  color: #341c02;
}



.image-message img {
  max-width: 100%;
  border-radius: 4px;
  margin-top: 0.5rem;
}



@media (max-width: 768px) {
  .messages-area {
    height: calc(100vh - 150px);
  }
  
  .card {
    max-width: 85%;
  }
  
  .chat-textarea {
    font-size: 16px;
  }
}
</style>