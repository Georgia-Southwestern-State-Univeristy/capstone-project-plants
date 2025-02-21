# UserProfile.vue
<template>
  <div class="profile-page">
  <section>
    <div class="container py-5">
      <div class="row">
        <div class="col">
          <!-- For the navigation bar itself -->
<nav aria-label="breadcrumb" class="custom-nav rounded-3 p-3 mb-4 d-flex justify-content-center" id="profile-nav">
  <ol class="breadcrumb mb-0">
    <li class="breadcrumb-item"><router-link to="/chat" id="return-link">Return to Chat</router-link></li>
  </ol>
</nav>
        </div>
      </div>

      <div class="row" style="background-color: #F5E6D3;">
        <!-- Profile Image Column -->
        <div class="col-lg-4" id="profileBox">
          <div class="card mb-4">
            <div class="card-body text-center" id="profileBox">
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
</div>
</template>

<script>
import { ref, computed, watchEffect } from 'vue';
import { useAuthStore } from '@/store/authStore';
import { storeToRefs } from 'pinia';
import { db, auth } from '@/utils/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';

export default {
  name: 'UserProfile',

  setup() {
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore); // ✅ Get reactive user data from Pinia
    const profileImage = ref(null);
    const userData = ref({
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });

    const isEditing = ref({
      name: false,
      password: false
    });

    const showPassword = ref(false);
    const originalData = ref(null);

    // ✅ Load user profile from Firestore
    const loadUserProfile = async () => {
      if (!user.value) return;

      try {
        const userDocRef = doc(db, 'users', user.value.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userDataFromDB = userDocSnap.data();
          userData.value.name = userDataFromDB.name || '';
          userData.value.email = user.value.email;
          profileImage.value = userDataFromDB.profileImage || null;
          originalData.value = { ...userData.value };
        } else {
          console.warn('User profile not found in Firestore.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    // ✅ Watch for user changes and load profile
    watchEffect(() => {
      if (user.value) {
        loadUserProfile();
      }
    });

    const hasChanges = computed(() => {
      return userData.value.name !== originalData.value?.name;
    });

    // ✅ Save changes (Name, Profile Image)
    const saveChanges = async () => {
      if (!user.value) return;

      try {
        const userDocRef = doc(db, 'users', user.value.uid);
        await updateDoc(userDocRef, { name: userData.value.name });

        alert('Profile updated successfully!');
        originalData.value = { ...userData.value };
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Error updating profile');
      }
    };

    // ✅ Handle Profile Image Upload
    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        profileImage.value = e.target.result;

        try {
          const userDocRef = doc(db, 'users', user.value.uid);
          await updateDoc(userDocRef, { profileImage: profileImage.value });

          alert('Profile picture updated successfully!');
        } catch (error) {
          console.error('Error updating profile image:', error);
          alert('Error updating profile picture');
        }
      };

      reader.readAsDataURL(file);
    };

    // ✅ Save Password Change
    const savePasswordChange = async () => {
      if (userData.value.newPassword !== userData.value.confirmPassword) {
        alert('New passwords do not match');
        return;
      }

      try {
        const userAuth = auth.currentUser;
        if (!userAuth) throw new Error('User not logged in');

        await updatePassword(userAuth, userData.value.newPassword);
        alert('Password updated successfully!');

        cancelPasswordChange();
      } catch (error) {
        console.error('Error changing password:', error);
        alert('Error changing password');
      }
    };

    const cancelPasswordChange = () => {
      userData.value.currentPassword = '';
      userData.value.newPassword = '';
      userData.value.confirmPassword = '';
      isEditing.value.password = false;
      showPassword.value = false;
    };

    return {
      user,
      userData,
      profileImage,
      isEditing,
      showPassword,
      hasChanges,
      saveChanges,
      handleImageUpload,
      savePasswordChange,
      cancelPasswordChange
    };
  }
};
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


/* Apply the cream background to the entire page */
.profile-page {
  background-color: #F5E6D3;
  min-height: 100vh;
}



 /* #341c02; */


.custom-nav {
  background-color: #341c02; 
}

#profile-nav {
  background-color: #341c02; 
  width: 15%;
 
}

#return-link {
  color: #F5E6D3; 
  text-decoration: none;
  font-weight: bold;
  
  
}

#return-link:hover {
  text-decoration: underline;
}


.breadcrumb-item a {
  color: #F5E6D3;  
}

div#profileBox {
    height: 100px;

}

</style>