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
        <div v-for="msg in chatStore.messages" 
             :key="msg.id" 
             class="card mb-3"
             :class="msg.isUser ? 'ms-auto' : 'me-auto'"
             style="max-width: 70%;">
          <div class="card-header">
            {{ msg.isUser ? 'You' : 'Verdure AI' }}
          </div>
          <div class="card-body">
            <div v-if="msg.type === 'text'" class="message-content">
              <p class="mb-0">{{ msg.content }}</p>
            </div>
            <div v-else-if="msg.type === 'image'" class="image-message">
              <img :src="msg.content" 
                   class="img-fluid rounded" 
                   alt="Uploaded plant image">
            </div>
          </div>
        </div>
      </div>

      <!-- Input area -->
      <div class="chat-input-container">
        <div v-if="uploadedFile" class="file-preview">
          <div class="file-preview-content">
            <span class="file-name">{{ uploadedFile.name }}</span>
            <button class="remove-file" @click="removeUpload">
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <div class="input-group">
          <input type="file" 
                 ref="fileInput" 
                 class="d-none" 
                 accept="image/*" 
                 @change="handleFileUpload">
          
          <button class="camera-button" @click="triggerCamera">
            <i class="bi bi-camera-fill"></i>
          </button>

          <button class="attach-button" @click="triggerFileUpload">
            <i class="bi bi-paperclip"></i>
          </button>

          <textarea
            class="form-control chat-textarea" 
            placeholder="Ask about your plants or upload an image..." 
            v-model="userInput"
            @input="adjustTextarea"
            @keyup.enter.exact="sendMessage"
            ref="textInput"
          ></textarea>

          <button class="send-button" @click="sendMessage">
            <i class="bi bi-send-fill"></i>
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useChatStore } from '@/stores/chat';

export default {
  name: 'ChatInterface',
  setup() {
    const router = useRouter();
    const userStore = useUserStore();
    const chatStore = useChatStore();

    const fileInput = ref(null);
    const textInput = ref(null);
    const messagesContainer = ref(null);
    const userInput = ref('');
    const uploadedFile = ref(null);

    const adjustTextarea = () => {
      const textarea = textInput.value;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
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

    const handleSignOut = async () => {
      await userStore.logout();
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

      await nextTick();
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    };

    watch(() => chatStore.messages, async () => {
      await nextTick();
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    }, { deep: true });

    onMounted(async () => {
      if (userStore.isAuthenticated) {
        await chatStore.loadChatHistory(userStore.user.uid);
      }
    });

    return {
      fileInput,
      textInput,
      messagesContainer,
      userInput,
      uploadedFile,
      adjustTextarea,
      handleFileUpload,
      removeUpload,
      triggerFileUpload,
      handleSignOut,
      sendMessage
    };
  }
};



</script>

<style scoped>
.chat-container {
  min-height: 100vh;
  background-color: #341c02;
  position: relative;
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

.chat-textarea {
  resize: none;
  min-height: 44px;
  max-height: 200px;
  border-radius: 8px;
  padding: 0.75rem;
}

.camera-button,
.attach-button,
.send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-button {
  background-color: #341c02;
  color: #F5E6D3;
}

.attach-button {
  background-color: #341c02;
}

.attach-button i {
  color: white;
}

.send-button {
  background-color: #341c02;
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