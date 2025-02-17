# UserProfile.vue
<template>
  <section style="background-color: #eee;">
    <div class="container py-5">
      <div class="row">
        <div class="col">
          <nav aria-label="breadcrumb" class="bg-body-tertiary rounded-3 p-3 mb-4">
            <ol class="breadcrumb mb-0">
              <li class="breadcrumb-item"><router-link to="/chat">Return to Chat</router-link></li>
              
            </ol>
          </nav>
        </div>
      </div>

      <div class="row">
        <!-- Profile Image Column -->
        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-body text-center">
              <!-- Profile Image with Upload -->
              <div class="position-relative d-inline-block">
                <img 
                  :src="profileImage || '/api/placeholder/150/150'" 
                  alt="Profile"
                  class="rounded-circle"
                  style="width: 150px; height: 150px; object-fit: cover;"
                >
                <label class="position-absolute bottom-0 end-0 p-2 bg-primary rounded-circle" 
                       style="cursor: pointer; background-color: #072d13 !important">
                  <i class="fas fa-camera text-white"></i>
                  <input 
                    type="file" 
                    class="d-none" 
                    accept="image/*"
                    @change="handleImageUpload"
                  >
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Details Column -->
        <div class="col-lg-8">
          <div class="card mb-4">
            <div class="card-body">
              <!-- Name Field -->
              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0">Name</p>
                </div>
                <div class="col-sm-9">
                  <div class="d-flex align-items-center">
                    <div v-if="isEditing.name" class="input-group">
                      <input 
                        type="text" 
                        v-model="userData.name" 
                        class="form-control"
                        @keyup.enter="toggleEdit('name')"
                      >
                      <button 
                        class="btn btn-outline-secondary" 
                        @click="toggleEdit('name')"
                      >
                        <i class="fas fa-save"></i>
                      </button>
                    </div>
                    <p v-else class="text-muted mb-0">
                      {{ userData.name }}
                      <i class="fas fa-pen ms-2 text-primary" 
                         @click="toggleEdit('name')" 
                         style="cursor: pointer; color: #072d13 !important">
                      </i>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Email Field -->
              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0">Email</p>
                </div>
                <div class="col-sm-9">
                  <div class="d-flex align-items-center">
                    <div v-if="isEditing.email" class="input-group">
                      <input 
                        type="email" 
                        v-model="userData.email" 
                        class="form-control"
                        @keyup.enter="toggleEdit('email')"
                      >
                      <button 
                        class="btn btn-outline-secondary" 
                        @click="toggleEdit('email')"
                      >
                        <i class="fas fa-save"></i>
                      </button>
                    </div>
                    <p v-else class="text-muted mb-0">
                      {{ userData.email }}
                      <i class="fas fa-pen ms-2 text-primary" 
                         @click="toggleEdit('email')" 
                         style="cursor: pointer; color: #072d13 !important">
                      </i>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Password Field -->
              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0">Password</p>
                </div>
                <div class="col-sm-9">
                  <div class="d-flex align-items-center">
                    <div v-if="isEditing.password" class="w-100">
                      <div class="input-group mb-2">
                        <input 
                          :type="showPassword ? 'text' : 'password'" 
                          v-model="userData.currentPassword" 
                          class="form-control"
                          placeholder="Current Password"
                        >
                      </div>
                      <div class="input-group mb-2">
                        <input 
                          :type="showPassword ? 'text' : 'password'" 
                          v-model="userData.newPassword" 
                          class="form-control"
                          placeholder="New Password"
                        >
                      </div>
                      <div class="input-group mb-2">
                        <input 
                          :type="showPassword ? 'text' : 'password'" 
                          v-model="userData.confirmPassword" 
                          class="form-control"
                          placeholder="Confirm New Password"
                        >
                        <button 
                          class="btn btn-outline-secondary" 
                          type="button"
                          @click="showPassword = !showPassword"
                        >
                          <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                        </button>
                      </div>
                      <div class="d-flex justify-content-end gap-2">
                        <button 
                          class="btn btn-secondary" 
                          @click="cancelPasswordChange"
                        >
                          Cancel
                        </button>
                        <button 
                          class="btn btn-primary" 
                          @click="savePasswordChange"
                          style="background-color: #072d13; border: none;"
                        >
                          Update Password
                        </button>
                      </div>
                    </div>
                    <p v-else class="text-muted mb-0">
                      ********
                      <i class="fas fa-pen ms-2 text-primary" 
                         @click="toggleEdit('password')" 
                         style="cursor: pointer; color: #072d13 !important">
                      </i>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Save Changes Button -->
              <div class="d-flex justify-content-end mt-4">
                <button 
                  @click="saveChanges" 
                  class="btn btn-primary"
                  :disabled="!hasChanges"
                  style="background-color: #072d13; border: none;"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'UserProfile',
  
  data() {
    return {
      userData: {
        name: 'John Doe',
        email: 'john@example.com',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      originalData: null,
      isEditing: {
        name: false,
        email: false,
        password: false
      },
      showPassword: false,
      profileImage: null
    }
  },

  computed: {
    hasChanges() {
      return this.userData.name !== this.originalData?.name || this.userData.email !== this.originalData?.email
    }
  },

  created() {
    // Store original data
    this.originalData = { ...this.userData }
  },

  methods: {
    toggleEdit(field) {
      if (field === 'password') {
        this.isEditing.password = !this.isEditing.password
        if (!this.isEditing.password) {
          this.cancelPasswordChange()
        }
      } else {
        this.isEditing[field] = !this.isEditing[field]
        if (!this.isEditing[field] && this.hasChanges) {
          this.saveChanges()
        }
      }
    },

    handleImageUpload(event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          this.profileImage = e.target.result
        }
        reader.readAsDataURL(file)
      }
    },

    async saveChanges() {
      try {
        // Implement save logic here
        console.log('Saving changes:', {
          name: this.userData.name,
          email: this.userData.email
        })
        
        this.originalData = { ...this.userData }
        alert('Changes saved successfully!')
      } catch (error) {
        console.error('Error saving changes:', error)
        alert('Error saving changes')
      }
    },

    async savePasswordChange() {
      if (this.userData.newPassword !== this.userData.confirmPassword) {
        alert('New passwords do not match')
        return
      }

      try {
        // Implement password change logic here
        console.log('Changing password')
        this.cancelPasswordChange()
        alert('Password updated successfully!')
      } catch (error) {
        console.error('Error changing password:', error)
        alert('Error changing password')
      }
    },

    cancelPasswordChange() {
      this.userData.currentPassword = ''
      this.userData.newPassword = ''
      this.userData.confirmPassword = ''
      this.isEditing.password = false
      this.showPassword = false
    }
  }
}
</script>

<style scoped>
.btn-primary:hover {
  background-color: #0a3b1e !important;
}

.input-group {
  max-width: 500px;
}

.fa-pen {
  font-size: 0.8em;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.fa-pen:hover {
  opacity: 1;
}
</style>