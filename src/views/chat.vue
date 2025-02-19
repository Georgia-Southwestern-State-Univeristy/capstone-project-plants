<template id="chatTemplate">
  <body id="bodyTemplate">
  <section class="bg-[#072d13] min-h-screen relative">
    <!-- Requirement 1: Account Icon -->
    <div class="fixed top-4 right-4 z-50">
      <div class="relative">
        <button 
          @click="store.toggleDropdown"
          class="w-10 h-10 rounded-full bg-[#F5E6D3] flex items-center justify-center shadow-md"
        >
          <i class="bi bi-person-fill text-[#072d13] text-xl"></i>
        </button>
        
        <div v-if="store.isDropdownOpen" 
             class="absolute right-0 mt-2 w-48 bg-[#F5E6D3] rounded-lg shadow-lg">
          <div class="py-1">
            <a href="#" class="block px-4 py-2 text-[#072d13] hover:bg-[#072d13]/10">Account</a>
            <a href="#" class="block px-4 py-2 text-[#072d13] hover:bg-[#072d13]/10">Sign Out</a>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-5">
      <div class="row d-flex justify-content-center">
        <div class="col-md-10 col-lg-8 col-xl-6">

          <div class="card" id="chat2">
            <!-- Requirement 4: Message Display Area -->
            <div class="card-body" ref="chatBody" style="height: 400px; overflow-y: auto;">
              <!-- Messages -->
              <div v-for="message in store.messages" 
                   :key="message.id" 
                   :class="[
                     'd-flex flex-row mb-4',
                     message.isUser ? 'justify-content-end' : 'justify-content-start'
                   ]">
                <div :class="[
                  'max-w-[70%]',
                  message.isUser ? 'order-2' : ''
                ]">
                  <div class="bg-[#F5E6D3] rounded-3 p-3">
                    <p class="text-[#072d13] font-semibold mb-2">
                      {{ message.isUser ? 'You' : 'Verdure AI' }}
                    </p>
                    <div v-if="message.type === 'image'" class="mb-2">
                      <img :src="message.content" 
                           class="img-fluid rounded" 
                           alt="Uploaded image">
                    </div>
                    <p v-else class="text-[#072d13] mb-0">{{ message.content }}</p>
                    <p class="small text-muted mt-2 mb-0">{{ message.timestamp }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Requirement 2 & 3: Chat Input Area -->
            <div class="card-footer bg-[#072d13] p-3">
              <!-- File Preview -->
              <div v-if="store.uploadedFile" 
                   class="mb-2 bg-white/90 border border-[#072d13] rounded px-3 py-1 d-inline-flex align-items-center">
                <span class="text-[#072d13] me-2">{{ store.uploadedFile.name }}</span>
                <button @click="store.clearUploadedFile" 
                        class="text-[#072d13] hover:opacity-75 border-none bg-transparent">
                  ×
                </button>
              </div>

              <div class="d-flex align-items-center">
                <!-- Camera Input -->
                <input ref="cameraInput" 
                       type="file" 
                       accept="image/*" 
                       capture="environment"
                       class="d-none" 
                       @change="handleFileUpload">
                
                <!-- Camera Button -->
                <button @click="$refs.cameraInput.click()" 
                        class="btn me-2">
                  <i class="bi bi-camera text-[#072d13] text-xl"></i>
                </button>

                <!-- File Input -->
                <input ref="fileInput" 
                       type="file" 
                       accept="image/*" 
                       class="d-none" 
                       @change="handleFileUpload">
                
                <!-- Paperclip Button -->
                <button @click="$refs.fileInput.click()" 
                        class="btn bg-[#072d13] border border-white rounded me-2">
                  <i class="bi bi-paperclip text-white"></i>
                </button>

                <!-- Text Input -->
                <textarea ref="messageInput"
                          v-model="messageText"
                          class="form-control flex-grow-1"
                          rows="1"
                          placeholder="Type your message..."
                          @input="adjustTextarea"></textarea>

                <!-- Send Button -->
                <button @click="sendMessage" 
                        class="btn ms-2 transition-transform active:scale-90">
                  <i class="bi bi-send-fill text-[#072d13] text-xl"></i>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

   
    
  </section>
</body>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useChatStore } from '@/store/chatStore'

const store = useChatStore()
const messageText = ref('')
const chatBody = ref(null)
const messageInput = ref(null)
const fileInput = ref(null)
const cameraInput = ref(null)

// Requirement 2: Auto-expanding textarea
const adjustTextarea = () => {
  const textarea = messageInput.value
  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

// Requirement 3: File handling
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    store.setUploadedFile(file)
  }
}

const sendMessage = () => {
  store.sendMessage(messageText.value)
  messageText.value = ''
  adjustTextarea()
}

// Auto-scroll to bottom when new messages arrive
watch(() => store.messages, () => {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
}, { deep: true })

onMounted(() => {
  if (chatBody.value) {
    chatBody.value.scrollTop = chatBody.value.scrollHeight
  }
})
</script>

<style scoped>
body#bodyTemplate {
color: #341c02;

}




/* Basic chat styling from template */
#chat2 .form-control {
  border-color: transparent;
}

#chat2 .form-control:focus {
  border-color: transparent;
  box-shadow: inset 0px 0px 0px 1px transparent;
}

.divider:after,
.divider:before {
  content: "";
  flex: 1;
  height: 1px;
  background: #eee;
}

/* Requirement-specific styling */
.card {
  border: none;
  border-radius: 15px;
  background-color: white;
}

.card-body {
  background-color: white;
  border-radius: 15px 15px 0 0;
}

.card-footer {
  border-radius: 0 0 15px 15px;
}

/* Message animations */
.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>