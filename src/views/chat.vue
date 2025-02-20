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
      <div class="messages-area mb-4" ref="messagesContainer">
        <div v-for="msg in chatStore.messages" 
             :key="msg.id" 
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
          <!-- Hidden file inputs -->
          <input 
            type="file" 
            ref="fileInput" 
            class="d-none" 
            accept="image/*" 
            @change="handleFileUpload"
          />

          
          
          <!-- Camera button -->
          <!-- Add this before chat-input-container -->
<div v-if="showCamera" class="camera-overlay">
  <div class="camera-container">
    <Camera 
      @capture="onCapture"
      @close="showCamera = false"
    >
      <template #controls>
        <div class="camera-controls">
          <button class="camera-button" @click="triggerCamera">
            <i class="bi bi-camera-fill"></i>
          </button>
          <button class="close-camera" @click="showCamera = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </template>
    </Camera>
  </div>
</div>

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
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
// Add at the top with other imports
import { Camera } from 'simple-vue-camera'

// Store and router setup
const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

// Refs for DOM elements
const fileInput = ref(null);
const textInput = ref(null);
const cameraInput = ref(null);
const messagesContainer = ref(null);


// State refs
const userInput = ref('');
const uploadedFile = ref(null);
const isDropdownOpen = ref(false);


// Camera refs
// Add with your other refs
const showCamera = ref(false);

// Camera section
// Add below your imports
const components = {
  Camera
}

const triggerCamera = () => {
  showCamera.value = true;
};

const onCapture = (blob) => {
  // Create file from blob
  const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
  
  // Use existing upload handler
  uploadedFile.value = {
    name: 'camera-capture.jpg',
    file: file
  };
  
  // Close camera
  showCamera.value = false;
};



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
    uploadedFile.value = {
      name: file.name,
      file: file
    };
  }
};

const removeUpload = () => {
  uploadedFile.value = null;
  if (fileInput.value) fileInput.value.value = '';
  if (cameraInput.value) cameraInput.value.value = '';
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

// Message handling
const sendMessage = async () => {
  if (!userInput.value.trim() && !uploadedFile.value) return;

  if (uploadedFile.value) {
    await chatStore.addMessage({
      id: Date.now(),
      type: 'image',
      content: URL.createObjectURL(uploadedFile.value.file),
      isUser: true,
      timestamp: new Date()
    });
    removeUpload();
  }

  if (userInput.value.trim()) {
    await chatStore.addMessage({
      id: Date.now(),
      type: 'text',
      content: userInput.value,
      isUser: true,
      timestamp: new Date()
    });
    userInput.value = '';
    adjustTextarea();
  }

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

.camera-controls {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.close-camera {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  background-color: #341c02;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #F5E6D3;
}

.camera-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.camera-container {
  width: 100%;
  max-width: 600px;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.camera-button {
  color: #F5E6D3;
}


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

.camera-button,
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

.camera-button i,
.send-button i {
  color: #F5E6D3;
}

.attach-button i {
  color: white;
}

.send-button {
  transform: scale(1);
  transition: transform 0.2s;
}

.send-button:active {
  transform: scale(0.9);
}

.file-preview {
  position: absolute;
  bottom: 100%;
  left: 58px;
  background-color: white;
  border: 2px solid #341c02;
  border-radius: 4px;
  padding: 4px 8px;
  margin-bottom: 0.5rem;
}

.file-preview-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
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