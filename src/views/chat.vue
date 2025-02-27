<template>
  <main>
    <div id="chatBackground" class="chat-container px-4 py-5">
      <!-- 🔹 Account Icon Dropdown -->
      <div class="d-flex justify-content-end p-3 position-fixed end-0 top-0" style="z-index: 1000;">
        <div class="dropdown">
          <button class="account-circle" type="button" @click="toggleDropdown">
            <i class="bi bi-person-fill"></i>
          </button>
          <ul class="account-dropdown" :class="{ 'show': isDropdownOpen }">
            <li>
              <router-link to="/userprofile" class="dropdown-item">Account</router-link>
            </li>
            <li>
              <a href="#" class="dropdown-item" @click.prevent="handleSignOut">Sign Out</a>
            </li>
          </ul>
        </div>
      </div>

      <!-- 🔹 Messages Display Area -->
 <!-- 🔹 Messages Display Area -->
<div class="messages-area mb-4" ref="messagesContainer">
  <div 
    v-for="msg in chatStore.messages" 
    :key="msg.id" 
    :class="['message-wrapper', msg.isUser ? 'user-wrapper' : 'ai-wrapper']"
  >
    <div 
      class="card mb-3 message-card"
      :class="[msg.isUser ? 'user-message' : 'ai-message']"
    >
      <div class="card-header" :class="msg.isUser ? 'user-header' : 'ai-header'">
        {{ msg.isUser ? 'You' : 'Verdure AI' }}
      </div>
      <!-- Replace the entire card-body div with this: -->
<div class="card-body">
  <!-- Text Message - always show if there's content -->
  <div v-if="msg.content && msg.content.trim()" class="message-content">
    <p class="mb-0" :class="msg.isUser ? 'user-text' : 'ai-text'" v-html="msg.content"></p>
  </div>

  <!-- Image Message - show if there's an image -->
  <div v-if="msg.image || (msg.type === 'image' && msg.content)" class="image-message">
    <img 
      :src="msg.image || msg.content" 
      class="img-fluid rounded" 
      alt="Uploaded plant image"
    />
  </div>
  
  <!-- Add Plant Button (only show for AI responses with plant info) -->
  <div v-if="!msg.isUser" class="mt-3 text-end">
    <button 
      class="btn add-plant-btn" 
      @click="addPlantToCollection(msg)"
    >
      Add plant to plant collection?
    </button>
  </div>
</div>
    </div>
  </div>
</div>

      <!-- 🔹 Input Area (Fixed at Bottom) -->
      <div class="chat-input-container">
        <!-- 🔹 File Preview (If Exists) -->
        <TransitionGroup name="file-preview" tag="div" class="file-previews-container">
          <div v-for="file in uploadedFiles" :key="file.id" class="file-preview">
            <div class="file-preview-content">
              <span class="file-name">{{ file.name }}</span>
              <button class="remove-file" @click="() => removeUpload(file.id)">
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>
        </TransitionGroup>

        <div class="input-group">
          <!-- 🔹 Hidden File Input -->
          <input 
            type="file" 
            ref="fileInput" 
            class="d-none" 
            accept="image/*" 
            @change="handleFileUpload"
          />

          <!-- 🔹 Image Upload Button -->
          <button class="attach-button" @click="triggerFileUpload">
            <i class="bi bi-paperclip"></i>
          </button>

          <!-- 🔹 Text Input -->
          <textarea
            class="form-control chat-textarea" 
            placeholder="Ask about your plants or upload an image..." 
            v-model="userInput"
            @input="adjustTextarea"
            @keyup.enter.exact="sendMessage"
            ref="textInput"
          ></textarea>

          <!-- 🔹 Send Button -->
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


// KENDRICK CHANGE - added more imports for vuetify cards
import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

import axios from 'axios';

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
const uploadedFiles = ref([]);
const isDropdownOpen = ref(false);

// 🔹 Adjust textarea height dynamically
console.log("🔍 Chat Store Initialized:", chatStore);
if (!chatStore) {
  console.error("❌ chatStore is undefined! Check if Pinia is initialized.");
}

const adjustTextarea = () => {
  const textarea = textInput.value;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

// KENDRICK CHANGE - I modified the handleFileUpload to deal with one image at
// a time. 

// Replace the existing handleFileUpload function with this:
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type.startsWith('image/')) {
    // Clear existing uploads first (to ensure only one at a time)
    uploadedFiles.value = [];
    
    // Add the new file
    uploadedFiles.value.push({
      id: Date.now(),
      name: file.name,
      file: file
    });
  }
};

// 🔹 Remove uploaded files
const removeUpload = (id) => {
  uploadedFiles.value = uploadedFiles.value.filter(file => file.id !== id);
};

// 🔹 Trigger file input click
const triggerFileUpload = () => {
  fileInput.value?.click();
};

// KENDRICK CHANGE - I edited the send message feature so the user can 
// see both their text input and their picture upload within the same card.

// 🔹 Send Message (Handles Text & Image Upload)
// Replace the sendMessage function with this:
const sendMessage = async () => {
  if (!uploadedFiles.value.length && !userInput.value.trim()) return;

  console.log("🔍 Chat Store Before Sending:", chatStore.messages);

  // Updated user message to support both text and image
  const userMessage = {
    id: Date.now(),
    type: uploadedFiles.value.length && userInput.value.trim() ? "both" : 
         (uploadedFiles.value.length ? "image" : "text"),
    content: userInput.value.trim(),
    image: uploadedFiles.value.length ? URL.createObjectURL(uploadedFiles.value[0].file) : null,
    isUser: true,
    timestamp: new Date(),
  };

  console.log("📢 [Chat.vue] Sending User Message:", userMessage);
  chatStore.sendMessage(userMessage);

  const formData = new FormData();
  formData.append("message", userInput.value.trim());

  if (uploadedFiles.value.length) {
    formData.append("image", uploadedFiles.value[0].file);
  }

  try {
    const response = await axios.post("/api/chat/chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("✅ AI Response from Backend:", response.data.message);

    // Updated AI message to match user message structure
    const aiMessage = {
      id: Date.now() + 1,
      type: response.data.image ? (response.data.message ? "both" : "image") : "text",
      content: response.data.message || "",
      image: response.data.image || null,
      isUser: false,
      timestamp: new Date(),
    };

    console.log("📢 [Chat.vue] Sending AI Message:", aiMessage);
    chatStore.sendMessage(aiMessage);

    uploadedFiles.value = [];
    await nextTick();
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;

  } catch (error) {
    console.error("❌ Chat API Error:", error);
  }

  userInput.value = "";
  
  // Reset file input to allow the same file to be selected again
  if (fileInput.value) {
    fileInput.value.value = ""; // This clears the file input
  }
};


// 🔹 Handle user sign-out
const handleSignOut = async () => {
  await authStore.logout();
  router.push('/login');
};

// 🔹 Toggle account dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 🔹 Auto-scroll when messages update
// 🔹 Auto-scroll when messages update
watch(() => chatStore.messages, async () => {
  await nextTick();
  console.log("Updating chat messages...", chatStore.messages);
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}, { deep: true });


// 🔹 Load chat history on mount
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

// KENDRICK CHANGE - I added a button so that when a plant is identified by the
// AI, you have an option to add a plant from the chat page.
// Update the addPlantToCollection function to handle the new message structure
const addPlantToCollection = async (message) => {
  if (!authStore.isAuthenticated) {
    alert("Please log in to add plants to your collection");
    router.push('/login');
    return;
  }

  try {
    // Extract plant name from the message
    const plantInfo = message.content;
    
    // Try to extract plant name with regex
    let plantName = "Unknown Plant";
    const nameMatch = plantInfo.match(/<b>Plant Name:<\/b> ([^<]+)/);
    if (nameMatch && nameMatch[1]) {
      plantName = nameMatch[1].trim();
    }
    
    // Create a new plant document in Firestore
    const userId = authStore.user.uid;
    const plantsRef = collection(db, 'users', userId, 'plants');
    
    await addDoc(plantsRef, {
      name: plantName,
      type: plantName, 
      wateringSchedule: { frequency: '7 days' },
      lastWatered: new Date().toISOString(),
      healthStatus: 'Healthy',
      notes: plantInfo,
      createdAt: new Date().toISOString(),
      image: message.image || null // Use the image property
    });

    alert(`${plantName} added to your plant collection!`);
  } catch (error) {
    console.error("Error adding plant to collection:", error);
    alert("Failed to add plant to collection");
  }
};



</script>


<style scoped>

.message-content {
  margin-bottom: 12px; /* Space between text and image */
}



/* Main container styling */
.chat-container {
  min-height: 100vh;
  background-color: #341c02;
  position: relative;
  overflow-x: hidden;
}

/* Message display area */
.messages-area {
  height: calc(100vh - 200px);
  overflow-y: auto;
  padding: 25px;
  margin-bottom: 100px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Message positioning wrappers */
.message-wrapper {
  width: 100%;
  display: flex;
  padding-bottom: 5px;
}

.user-wrapper {
  justify-content: center;
  padding-right: 25%;
}

.ai-wrapper {
  justify-content: center;
  padding-left: 25%;
}

/* Card styling - consolidated to avoid conflicts */
.message-card {
  width: 100%;
  max-width: 450px;
  margin-bottom: 16px !important;
  border: 2px solid #341c02; /* Add specific border color and width */
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeInUp 0.5s ease;
  background-color: #F5E6D3;
  opacity: 1;
}

/* Animation keyframes */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animation delays */
.message-wrapper:nth-child(odd) .message-card {
  animation-delay: 0.2s;
}

.message-wrapper:nth-child(even) .message-card {
  animation-delay: 0.3s;
}

/* Card hover effect */
.message-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Card header styling - consolidated */
.card-header {
  background-color: #F5E6D3;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  border-bottom: 1px solid #341c02; /* Add a subtle border */
  padding: 0.75rem 1rem;
  margin: 0;
  font-weight: bold;
  color: #341c02;
}

/* Card body styling */
.card-body {
  padding: 1rem;
  border-bottom-left-radius: 16px !important;
  border-bottom-right-radius: 16px !important;
  border-top: none;
  display: flex;
  flex-direction: column;
}

/* User and AI text styling */
.user-text, .ai-text {
  color: #341c02;
}

/* Image styling */
.image-message {
  max-width: 100%;
  align-self: center; /* Center the image in the card */
  margin-bottom: 8px;
}


.image-message img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Subtle shadow for images */
}

/* Add plant button styling */
.add-plant-btn {
  background-color: #F5E6D3;
  color: #341c02;
  border: 2px solid #341c02;
  border-radius: 20px;
  font-weight: bold;
  padding: 6px 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-plant-btn:hover {
  background-color: #341c02;
  color: #F5E6D3;
  transform: translateY(-2px);
}

/* Input area styling */
.chat-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  background-color: #341c02;
  z-index: 100; /* Add z-index to ensure it stays on top */
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
  border: none; /* Add this to remove default borders */
  outline: none; /* Add this to remove focus outline */
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
  cursor: pointer; /* Add this to show it's clickable */
}

.send-button i {
  color: #F5E6D3;
}

.attach-button i {
  color: #F5E6D3;
}

.send-button {
  transform: scale(1);
  transition: transform 0.2s;
}

.send-button:active {
  transform: scale(0.9);
}

/* Account circle styling */
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
  z-index: 1010; /* Higher than other elements */
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

/* File preview styling */
.file-previews-container {
  position: absolute;
  bottom: 100%;
  left: 58px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  z-index: 101; /* Above input area */
}

.file-preview {
  background-color: #F5E6D3;
  border: 2px solid #341c02;
  border-radius: 8px; /* Increase from 4px for consistency */
  padding: 4px 8px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease-out;
  display: flex;
}

.file-preview-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
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

/* File preview animations */
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
  transform: translateY(20px);
}

.file-preview-move {
  transition: transform 0.3s ease-out;
}

/* Media queries */
@media (max-width: 768px) {
  .messages-area {
    height: calc(100vh - 150px);
    padding: 15px; /* Reduce padding on smaller screens */
  }
  
  .message-card {
    max-width: 85%;
  }
  
  .chat-textarea {
    font-size: 16px; /* Better for touch devices */
  }
  
  .user-wrapper {
    padding-right: 15%; /* Less padding on mobile */
  }
  
  .ai-wrapper {
    padding-left: 15%; /* Less padding on mobile */
  }
}
</style>