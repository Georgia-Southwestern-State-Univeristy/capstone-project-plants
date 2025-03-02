<template>
  <main class="w-100 h-100">
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
      class="card mb-3 message-card animate-in"
      :class="msg.isUser ? 'user-message' : 'ai-message'"
    >
      <div class="card-header" :class="msg.isUser ? 'user-header' : 'ai-header'">
        {{ msg.isUser ? 'You' : 'Verdure AI' }}
      </div>

      <div class="card-body">
        <!-- Display Text Message -->
        <div v-if="msg.content?.trim()" class="message-content">
          <p class="mb-0" :class="msg.isUser ? 'user-text' : 'ai-text'" v-html="msg.content"></p>
        </div>

        <!-- Display Image Message -->
        <div v-if="msg.image || (msg.type === 'image' && msg.content)" class="image-message">
          <img 
            :src="msg.image || msg.content" 
            class="img-fluid rounded" 
            alt="Uploaded plant image"
          />
        </div>

        <!-- Add Plant Button (Only for AI responses related to plants) -->
        <div v-if="!msg.isUser && msg.isResponseToImage && (isPlantDescription(msg.content) || msg.image)" class="mt-3 text-end">
          <button class="btn add-plant-btn" @click="addPlantToCollection(msg)">
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

// KENDRICK CHANGE - I edited the send message feature so the user can 
// see both their text input and their picture upload within the same card.

// 🔹 Send Message (Handles Text & Image Upload)
// Replace the sendMessage function with this:
const sendMessage = async () => {
  if (!uploadedFiles.value.length && !userInput.value.trim()) return;

  const auth = getAuth();
  const user = auth.currentUser;
  
  if (!user) {
    console.error("🚫 User not authenticated");
    return;
  }

  try {
    const idToken = await user.getIdToken(); // ✅ Fetch latest token

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

    // ✅ Attach Firebase ID Token
    formData.append("idToken", idToken);

    const response = await axios.post("/api/chat/chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const aiMessage = {
      id: Date.now() + 1,
      type: response.data.image ? (response.data.message ? "both" : "image") : "text",
      content: response.data.message || "",
      image: response.data.image || null,
      isUser: false,
      timestamp: new Date(),
      isResponseToImage: hasImage, // Add this flag to track if this response is for an image
    };

    chatStore.sendMessage(aiMessage);

    // Reset inputs
    uploadedFiles.value = [];
    userInput.value = "";

    // Reset file input to allow the same file to be selected again
    if (fileInput.value) {
      fileInput.value.value = ""; // This clears the file input
    }

    await nextTick();
    scrollToBottom();
  } catch (error) {
    console.error("❌ Chat API Error:", error);
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
  
  // Check for common patterns in plant descriptions
  const plantIdentifiers = [
    'Common Names:',
    'Common Name:',
    'Scientific Name:',
    'Family:',
    'Origin:',
    'Key Identifying Features:'

  ];
  
  return plantIdentifiers.some(phrase => 
    content.includes(phrase) || content.toLowerCase().includes(phrase.toLowerCase())
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

        const data = await response.json();
        return data.aiResponse || null;
    } catch (error) {
        console.error("❌ Failed to fetch last AI response:", error);
        return null;
    }
};

const addPlantToCollection = async (message) => {
    if (!authStore.isAuthenticated) {
        alert("Please log in to add plants to your collection");
        router.push('/login');
        return;
    }

    try {
        // Fetch the latest AI response before adding the plant
        const aiResponse = await fetchLastAIResponse();
        if (!aiResponse) {
            alert("No plant information found to add to collection.");
            return;
        }

        const plantInfo = message.content;
        let plantName = "Unknown Plant";
        const nameMatch = plantInfo.match(/<b>Plant Name:<\/b> ([^<]+)/);
        if (nameMatch && nameMatch[1]) {
            plantName = nameMatch[1].trim();
        }

        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
            alert("User is not logged in.");
            return;
        }
        const idToken = await user.getIdToken();

        // Create FormData for image upload
        const formData = new FormData();
        formData.append("plantName", plantName);
        formData.append("aiResponse", aiResponse);
        formData.append("idToken", idToken);

        if (message.image) {
            const response = await fetch(message.image);
            const blob = await response.blob();
            formData.append("image", blob, "plant.jpg");
        }

        console.log("🚀 Sending to /add-plant:", { plantName, aiResponse, idToken });

        // Send request to backend
        const res = await fetch("/api/chat/add-plant", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();

        if (data.success) {
          const confirmedPlantName = data.plantName || "your plant"; // Ensure a valid name is displayed
          alert(`${confirmedPlantName} added to your plant collection!`);
        } else {
          alert("Failed to add plant to collection.");
        }

    } catch (error) {
        console.error("Error adding plant to collection:", error);
        alert("An error occurred while adding the plant.");
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
  max-width: 600px; /* Increase max width */
  margin-bottom: 8px !important; /* Reduce bottom margin */
  border: 3px solid #341c02; /* Slightly thinner border */
  border-radius: 16px !important;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  will-change: transform, opacity;
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
  max-width: 100%;
  max-height: 300px; /* Limit height to prevent huge images */
  object-fit: contain;
  border-radius: 8px;
  margin: 0 auto;
  display: block;
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