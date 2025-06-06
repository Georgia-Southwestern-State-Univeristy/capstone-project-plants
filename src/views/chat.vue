<template>
  <main class="w-100 h-100">
    <div v-if="toastMessage" :class="['toast-popup', toastType]">
      {{ toastMessage }}
    </div>
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
              <router-link to="/plantboard" class="dropdown-item">Plant Gallery</router-link>
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
  :class="[
    msg.isUser ? 'user-message' : 'ai-message',
    'animate-in' /* Add animation class here instead */
  ]"
>
<div class="card-header" :class="msg.isUser ? 'user-header' : 'ai-header'">
  {{ msg.isUser ? 'You' : 'Verdure AI' }}
</div>
      <!-- Replace the entire card-body div with this: -->
<div class="card-body">
<!-- Formatted AI Response Display -->
<div v-if="!msg.isUser && isValidPlantData(msg.content)" class="formatted-plant-response">
  <h5 class="plant-title">{{ msg.content.plantName }}</h5>
  <p class="scientific-name"><i>{{ msg.content.scientificName }}</i></p>

  <div class="plant-info">
    <p><strong>☀️ Sunlight:</strong> {{ msg.content.sunlight }}</p>
    <p><strong>💧 Watering:</strong> {{ msg.content.wateringSchedule }}</p>
    <p><strong>🌱 Soil Type:</strong> {{ msg.content.soilType }}</p>
    <p><strong>📈 Growth Habit:</strong> {{ msg.content.growthHabit }}</p>
    <p><strong>🌿 Common Uses:</strong> {{ msg.content.commonUses }}</p>
    <p><strong>⚠️ Common Issues:</strong> {{ msg.content.commonIssues }}</p>
    <p><strong>🎉 Fun Fact:</strong> {{ msg.content.funFact }}</p>
  </div>
</div>

<!-- Text Message - only show for text messages when not displaying plant data -->
<div v-else-if="msg.content && (msg.type === 'text' || msg.type === 'both') && (!isValidPlantData(msg.content) || msg.isUser)" class="text-message">
  {{ msg.content }}
</div>

  <!-- Image Message - show if there's an image -->
  <div v-if="msg.image || (msg.type === 'image' && msg.content) || msg.type === 'both'" class="image-message">
    <img 
      :src="msg.image || msg.content" 
      class="img-fluid rounded" 
      alt="Uploaded plant image"
    />
  </div>
  
  <!-- Add Plant Button (only show for AI responses with plant info) -->
  <!-- Add Plant Button (only show for AI responses with plant info) -->
<!-- Add Plant Button (only show for AI responses to image uploads) -->
<div v-if="!msg.isUser && msg.isResponseToImage && (isPlantDescription(msg.content) || msg.image)" class="mt-3 text-end">
  <button 
    class="btn add-plant-btn" 
    @click="addPlantToCollection(msg)"
  >
    Add plant to collection
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
        <button class="send-button" @click="sendMessage" :disabled="isLoading">
        <i v-if="!isLoading" class="bi bi-send-fill"></i>
        <span v-else class="spinner-border spinner-border-sm" aria-hidden="true"></span>
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
import { getAuth } from 'firebase/auth';


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
const isLoading = ref(false);

const toastMessage = ref('');
const toastType = ref('info');

// 🔹 Adjust textarea height dynamically
console.log("🔍 Chat Store Initialized:", chatStore);
if (!chatStore) {
  console.error("❌ chatStore is undefined! Check if Pinia is initialized.");
}


// KENDRICK CHANGE - To prevent JSON data from appearing in AI responses
const isValidPlantData = (content) => {
  // First, check if content is a string that looks like JSON
  if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
    try {
      // Try to parse it as JSON
      content = JSON.parse(content);
    } catch (e) {
      // If parsing fails, it's not valid JSON
      return false;
    }
  }
  
  // Now check if the content (original or parsed) is a valid plant data object
  return content && 
  typeof content === "object" && 
  content.plantName !== undefined &&
  !Array.isArray(content);
};

const adjustTextarea = () => {
  const textarea = textInput.value;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
};

// KENDRICK CHANGE - I modified the handleFileUpload to deal with one image at
// a time. 

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
  
  // Reset file input to allow the same file to be selected again
  if (fileInput.value) {
    fileInput.value.value = ""; // This clears the file input
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

const showToast = (message, type = 'info') => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3000);
};


// KENDRICK CHANGE - NEW SEND MESSAGE FUNCTION DONE ON MARCH 29. 
// 🔹 Send Message (Handles Text & Image Upload)
const sendMessage = async () => {
  if (!uploadedFiles.value.length && !userInput.value.trim()) return;

  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error("🚫 User not authenticated");
    return;
  }

  try {
    isLoading.value = true; // Set loading to true at the start
    const idToken = await user.getIdToken();

    // Determine message type based on content
    const hasImage = uploadedFiles.value.length > 0;
    const userMessage = {
      id: Date.now(),
      type: hasImage && userInput.value.trim() ? "both" : 
            (hasImage ? "image" : "text"),
      content: userInput.value.trim(),
      image: hasImage ? URL.createObjectURL(uploadedFiles.value[0].file) : null,
      isUser: true,
      timestamp: new Date(),
    };

    chatStore.sendMessage(userMessage);

    const formData = new FormData();
    formData.append("message", userInput.value.trim());

    if (hasImage) {
      formData.append("image", uploadedFiles.value[0].file);
    }

    formData.append("idToken", idToken);

    // Save the current input value before clearing it
    const currentInput = userInput.value;
    
    // Reset inputs immediately for better UX
    uploadedFiles.value = [];
    userInput.value = "";
    
    // Reset file input
    if (fileInput.value) {
      fileInput.value.value = "";
    }
    
    await nextTick();
    scrollToBottom();

    // Perform the API call
    const response = await axios.post("/api/chat/chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("📩 Received AI Response:", response.data.message);

    const aiMessage = {
      id: Date.now() + 1,
      type: response.data.imageUrl ? (response.data.message ? "both" : "image") : "text",
      content: response.data.message ? response.data.message : "I couldn't retrieve plant details.",
      image: response.data.imageUrl || null,
      imageUrl: response.data.imageUrl || null,
      isUser: false,
      timestamp: new Date(),
      isResponseToImage: hasImage,
    };

    chatStore.sendMessage(aiMessage);
    
    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("❌ Chat API Error:", error);
    
    // Show an error message to the user
    chatStore.sendMessage({
      id: Date.now() + 1,
      type: "text",
      content: "Sorry, I encountered an error. Please try again later.",
      isUser: false,
      timestamp: new Date(),
    });
  } finally {
    isLoading.value = false; // Set loading to false when done
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
// Add a new utility function for debouncing
const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// Replace the existing watch function with this debounced version
const scrollToBottom = debounce(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}, 50);

watch(() => chatStore.messages, async () => {
  await nextTick();
  console.log("Updating chat messages...", chatStore.messages);
  scrollToBottom();
}, { deep: true });


// 🔹 Load chat history on mount
// onMounted(async () => {
//   if (authStore.isAuthenticated) {
//     await chatStore.loadChatHistory(authStore.user.uid);
//   }

//   document.addEventListener('click', (event) => {
//     const dropdown = document.querySelector('.dropdown');
//     if (!dropdown.contains(event.target)) {
//       isDropdownOpen.value = false;
//     }
//   });
// });

// KENDRICK CHANGE - I added this so that the add plant button only appears
// when the AI is describing a plant
const isPlantDescription = (content) => {
  if (!content) return false;

  // ✅ If AI response is a structured object, check for expected keys
  if (typeof content === "object") {
    return Boolean(
      content.plantName ||
      content.scientificName ||
      content.sunlightSchedule ||
      content.wateringSchedule
    );
  }

  // ✅ Fallback for older string-style responses
  const contentStr = String(content);
  const plantIdentifiers = [
    'Common Names:',
    'Common Name:',
    'Scientific Name:',
    'Family:',
    'Origin:',
    'Key Identifying Features:',
    'Sunlight:',
    'Watering:',
    'Soil Type:'
  ];

  return plantIdentifiers.some(phrase => 
    contentStr.includes(phrase) || contentStr.toLowerCase().includes(phrase.toLowerCase())
  );
};



// KENDRICK CHANGE - I added a button so that when a plant is identified by the
// AI, you have an option to add a plant from the chat page.
// Update the addPlantToCollection function to handle the new message structure
const fetchLastAIResponse = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return null;

        const idToken = await user.getIdToken();
        const response = await fetch(`/api/chat/get-last-chat?userId=${user.uid}`, {
            headers: { Authorization: `Bearer ${idToken}` }
        });

        if (!response.ok) {
            console.warn("⚠️ Server error:", response.statusText);
            return null;
        }

        const data = await response.json();
        return data.aiResponse || null;

    } catch (error) {
        console.error("❌ Failed to fetch last AI response:", error);
        return null;
    }
};


const addPlantToCollection = async (message) => {
  
  console.log("🧪 message received:", message);
  console.log("🧪 image:", message.image);

  if (!authStore.isAuthenticated) {
      showToast("Please log in to add plants to your collection.", "warning");
      router.push('/login');
      return;
  }

  try {
      // Fetch the latest AI response before adding the plant
      const aiResponse = await fetchLastAIResponse();
      if (!aiResponse) {
          showToast("No AI response found. Please try again.", "error");
          return;
      }

      const plantInfo = message.content;
      let plantName = typeof plantInfo === "object" && plantInfo.plantName
      ? plantInfo.plantName
      : "Unknown Plant";

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
          showToast("User not authenticated. Please log in.", "error");
          router.push('/login');
          return;
      }
      const idToken = await user.getIdToken();

      // Create FormData for image upload
      // const formData = new FormData();
      // formData.append("plantName", plantName);
      // formData.append("aiResponse", JSON.stringify(plantInfo));
      // formData.append("idToken", idToken);
      const imageUrl = message.imageUrl || message.image || null;
      const formData = new FormData();

      formData.append("imageUrl", imageUrl); // ✅ NEW
      formData.append("aiResponse", JSON.stringify(aiResponse));
      formData.append("idToken", idToken);
      
      console.log("🚀 Sending to /add-plant:", {
        plantName,
        aiResponse,
        imageUrl,
        idToken,
      });

      console.log("🚀 Sending to /add-plant:", { plantName, aiResponse, idToken });

      // Send request to backend
      const res = await fetch("/api/chat/add-plant", {
          method: "POST",
          body: formData,
      });

      const data = await res.json();

    if (data.success) {
      const confirmedPlantName = data.plantName || "your plant"; // Ensure a valid name is displayed
      showToast(`Successfully added ${confirmedPlantName} to your collection!`, "success");
    } else {
        showToast("Failed to add plant. Please try again.", "error");
    }
  } catch (error) {
      console.error("Error adding plant to collection:", error);
        showToast("An error occurred while adding the plant. Please try again.", "error");
  }
};


</script>


<style scoped>

.text-message {
  margin-bottom: 12px;
  white-space: pre-wrap; /* Preserves whitespace and line breaks */
  word-break: break-word; /* Prevents overflow of long words */
}


.formatted-plant-response {
  background-color: rgba(52, 28, 2, 0.05);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.plant-title {
  color: #072d13;
  font-weight: bold;
  margin-bottom: 4px;
}

.scientific-name {
  color: #666;
  margin-bottom: 12px;
  font-size: 0.9em;
}

.plant-info p {
  margin-bottom: 6px;
}


/* Loading indicator styling */
.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: fixed;
  bottom: 60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #341c02; /* Dark brown color */
  color: #F5E6D3; /* Cream color */
  padding: 8px 16px;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.loading-indicator .spinner-border {
  color: #F5E6D3; /* Cream color for spinner */
}

/* Update the send button for the loading state */
.send-button:disabled {
  opacity: 0.6;
}

.send-button .spinner-border {
  width: 1rem;
  height: 1rem;
  color: #341c02; /* Match the icon color */
}



.message-content {
  margin-bottom: 12px; /* Space between text and image */
}



/* Main container styling */
.chat-container {
  min-height: 100vh;
  background-color: #F5E6D3;
  position: relative;
  overflow-x: hidden;
  width: 100%; /* Full width */
  max-width: 100%; /* Remove max-width constraint */
  margin: 0;
  padding-bottom: 100px;
}





/* Message display area */
.messages-area {
  height: calc(100vh - 110px); /* Adjust for smaller input */
  overflow-y: auto;
  padding: 25px 5%; /* Horizontal percentage padding */
  margin-bottom: 70px; /* Reduce bottom margin */
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1400px; /* Wider max-width */
  margin-left: auto;
  margin-right: auto;
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
  max-width: 600px;
  margin-bottom: 12px;
  padding: 1rem;
  border-radius: 20px;
  border: none; /* Remove the harsh border */
  background-color: #ffffff; /* Clean, soft background */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Softer shadow */
  transition: box-shadow 0.2s ease, transform 0.2s ease;
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

/* Add this new class that will be applied dynamically */
.animate-in {
  animation: fadeInUp 0.3s ease-out forwards;
}



/* Card header styling - consolidated */
.card-header {
  background-color: white;
  padding: 0.75rem 1rem;
  margin: 0px;
  font-weight: bold;
  color: #072d13;
  border: solid;
  border-bottom-color: #341c02;
  border-top-color: white;
  border-left-color: white;
  border-right-color: white;
  justify-content: center;
  display: flex;
  
}




/* Card body styling */
.card-body {
  padding: 0.75rem 1rem;
  border-bottom-left-radius: 16px !important;
  border-bottom-right-radius: 16px !important;
  border-top: none;
  display: flex;
  flex-direction: column;
}

/* User and AI text styling */
.user-text, .ai-text {
  color: #072d13;
}

/* Image styling */
.image-message {
  max-width: 100%;
  align-self: center; /* Center the image in the card */
  margin-bottom: 8px;
}


.image-message img {
  width: 100%;
  max-height: 400px; /* Increase height for taller portraits */
  object-fit: cover; /* Fill the space while preserving aspect ratio */
  border-radius: 12px;
  display: block;
  margin: 0 auto;
  aspect-ratio: 3/4;
}


/* Add plant button styling */
.add-plant-btn {
  
  background-color: #072d13;
  color: white;
  
  border-radius: 20px;
  font-weight: bold;
  padding: 6px 12px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.add-plant-btn:hover {
  background-color: white;
  color: #072d13;
  transform: translateY(-2px);
  border: 2px solid #072d13;
}

/* Input area styling */
.chat-input-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem; /* Reduce padding */
  background-color: #F5E6D3;
  z-index: 100;
  border-top: 1px solid rgba(52, 28, 2, 0.2); /* Subtle border */
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05); /* Subtle shadow */
}

.input-group {
  max-width: 1200px; /* Wider input group */
  margin: 0 auto;
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}

.chat-textarea {
  resize: none;
  min-height: 44px;
  max-height: 120px; /* Limit max height */
  border-radius: 8px;
  padding: 0.5rem 0.75rem; /* Slightly reduce padding */
  background-color: white;
  color: #341c02;
  border: none;
  outline: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); /* Subtle shadow */
}

.attach-button,
.send-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer; /* Add this to show it's clickable */
  background-color: #F5E6D3;
}

.send-button i {
  color: #341c02;
}

.attach-button i {
  color: #341c02;
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
  background-color: #341c02;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.account-circle i {
  color:  #F5E6D3;
  font-size: 1.2rem;
}

.account-dropdown {
  background-color: #341c02;
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
  color: #F5E6D3;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  display: block;
  font-weight: 700;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  color: #F5E6D3;
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
  background-color: #341c02;
  border: 2px solid  #F5E6D3;
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
  color: #F5E6D3;
  font-weight: bold;
  margin: 0;
}

.remove-file {
  background: none;
  border: none;
  color: #F5E6D3;
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
/* Enhanced media queries to prevent cut-offs */
@media (max-width: 576px) {
  .messages-area {
    padding: 15px 10px; /* Smaller padding on mobile */
  }
  
  .message-card {
    max-width: 85%;
    font-size: 0.95rem; /* Slightly smaller font on mobile */
  }
  
  .user-wrapper, .ai-wrapper {
    padding-right: 0;
    padding-left: 0;
  }
  
  .chat-input-container {
    padding: 0.5rem; /* Smaller padding on mobile */
  }
}

@media (min-width: 577px) and (max-width: 768px) {
  .message-card {
    max-width: 75%;
  }
  
  .user-wrapper {
    padding-right: 1%;
  }
  
  .ai-wrapper {
    padding-left: 1%;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .message-card {
    max-width: 70%;
  }
}

@media (min-width: 993px) {
  .messages-area {
    padding: 25px 10%; /* More horizontal space on larger screens */
  }
}
</style>