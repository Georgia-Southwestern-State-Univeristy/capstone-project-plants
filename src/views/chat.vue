<template>
  <main>
    <div id="chatBackground" class="chat-container px-4 py-5">
      <!-- Account Icon Dropdown -->
     <!-- Replace the current account dropdown HTML with this -->
<!-- Update the account dropdown HTML -->

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
          <!-- Hidden file input -->
          <input type="file" 
                 ref="fileInput" 
                 class="d-none" 
                 accept="image/*" 
                 @change="handleFileUpload">
          
          <!-- Camera button -->
          <button class="camera-button" @click="triggerCamera">
            <i class="bi bi-camera-fill"></i>
          </button>

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
      <!-- Add this after your messages area -->
<div v-if="isCameraOpen" class="camera-preview-container">
  <!-- Loading indicator -->
  <div v-show="isLoading" class="camera-loading">
    <div class="loader"></div>
  </div>
  
  <!-- Camera view -->
  <div v-show="!isLoading" class="camera-box" :class="{ 'flash': isShotPhoto }">
    <div class="camera-shutter" :class="{'flash': isShotPhoto}"></div>
    <video 
      v-show="!isPhotoTaken" 
      ref="cameraRef" 
      width="450" 
      height="337.5" 
      autoplay
      playsinline
    ></video>
    <canvas 
      v-show="isPhotoTaken" 
      ref="canvasRef" 
      width="450" 
      height="337.5"
    ></canvas>
  </div>

  <!-- Camera controls -->
  <div class="camera-controls">
    <button class="capture-button" @click="takePhoto">
      <i class="bi bi-camera-fill"></i>
    </button>
    <button class="close-camera" @click="triggerCamera">
      <i class="bi bi-x-lg"></i>
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

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const fileInput = ref(null);
const textInput = ref(null);
const messagesContainer = ref(null);
const userInput = ref('');
const uploadedFile = ref(null);
const isCameraOpen = ref(false);
const isPhotoTaken = ref(false);
const isShotPhoto = ref(false);
const isLoading = ref(false);
const cameraRef = ref(null);
const canvasRef = ref(null);

 const triggerCamera = async () => {
  if (isCameraOpen.value) {
    isCameraOpen.value = false;
    isPhotoTaken.value = false;
    isShotPhoto.value = false;
    stopCameraStream();
  } else {
    isCameraOpen.value = true;
    createCameraElement();
  }
};

const createCameraElement = () => {
  isLoading.value = true;
  
  const constraints = {
    audio: false,
    video: true
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
      isLoading.value = false;
      if (cameraRef.value) {
        cameraRef.value.srcObject = stream;
      }
    })
    .catch(error => {
      isLoading.value = false;
      alert("The browser might not support camera access or there are some errors.");
    });
};

const stopCameraStream = () => {
  if (cameraRef.value && cameraRef.value.srcObject) {
    const tracks = cameraRef.value.srcObject.getTracks();
    tracks.forEach(track => {
      track.stop();
    });
  }
};

const takePhoto = () => {
  if (!isPhotoTaken.value) {
    isShotPhoto.value = true;
    setTimeout(() => {
      isShotPhoto.value = false;
    }, 50);
  }

  isPhotoTaken.value = !isPhotoTaken.value;

  if (canvasRef.value && cameraRef.value) {
    const context = canvasRef.value.getContext('2d');
    context.drawImage(cameraRef.value, 0, 0, 450, 337.5);
    
    // Convert to file and add to upload
    canvasRef.value.toBlob((blob) => {
      const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
      uploadedFile.value = {
        name: 'camera-capture.jpg',
        file: file
      };
      
      // Close camera after capture
      triggerCamera();
    }, 'image/jpeg');
  }
};



const adjustTextarea = () => {
  const textarea = textInput.value;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

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
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const triggerFileUpload = () => {
  fileInput.value?.click();
};

function triggerCamera() {
  // Implement camera functionality
  console.log('Camera functionality to be implemented');
}

const handleSignOut = async () => {
  await authStore.logout();
  router.push('/login');
};

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

  // Scroll to bottom after new message
  await nextTick();
  messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
};

// Auto-scroll to bottom when new messages arrive
watch(() => chatStore.messages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}, { deep: true });

// Load chat history on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await chatStore.loadChatHistory(authStore.user.uid);
  }
});

// Add this to your component's data/refs
const isDropdownOpen = ref(false);

// Add this method
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// Optional: Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (event) => {
    const dropdown = document.querySelector('.dropdown');
    if (!dropdown.contains(event.target)) {
      isDropdownOpen.value = false;
    }
  });
});




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
  border-radius: 8px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  list-style: none;
  display: none;
  position: absolute;
  right: 0;
  min-width: 160px;

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
  padding: 0.5rem 1rem;
  text-decoration: none;
  display: block;
  font-weight: 500;
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

.camera-button i {
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

.send-button i {
  color: #F5E6D3;
}

.file-preview {
  position: absolute;
  bottom: 100%;
  left: 58px;
  background-color: rgba(245, 230, 211, 0.9);
  border: 1px solid #341c02;
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

.camera-box {
  position: relative;
  width: 450px;
  max-width: 100%;
  margin: 0 auto;
}

.camera-shutter {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  opacity: 0;
  pointer-events: none;
}

.camera-shutter.flash {
  opacity: 1;
  animation: flash 0.05s ease-out;
}

@keyframes flash {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.camera-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #341c02;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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