# UserProfile.vue
<template>
  <div class="profile-page">
    <div v-if="toastMessage" :class="['toast-popup', toastType]">
      {{ toastMessage }}
    </div>
  <section>
    <div class="container py-5">
      <!-- Replace the current breadcrumb navigation -->
<div class="top-navigation">
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><router-link to="/chat">Chat</router-link></li>
      <li class="breadcrumb-item"><router-link to="/plantboard">Go to Plant Gallery</router-link></li>
      <li class="breadcrumb-item"><router-link to="/login">Sign Out</router-link></li>
    </ol>
  </nav>
</div>

      <div class="row" style="background-color: #F5E6D3;">
        <!-- Profile Image Column -->
        <!-- Profile Image Column -->
<div class="col-lg-4">
  <div class="profile-image-container d-flex justify-content-center align-items-center">
    <div class="position-relative">
      <!-- Profile Image with Placeholder Text -->
      <div class="profile-image-circle" :class="{'has-image': profileImage}">
        <img 
          v-if="profileImage" 
          :src="profileImage" 
          alt="Profile" 
          class="profile-img"
        >
        <div v-else class="placeholder-text">Add image</div>
      </div>
      
      <!-- Upload Button Circle -->
      <label class="upload-button-circle" for="profile-upload">
        <span class="plus-icon">+</span>
        <input 
          id="profile-upload"
          type="file" 
          class="d-none" 
          accept="image/*"
          @change="handleImageUpload"
        >
      </label>
    </div>
  </div>
</div>

        <!-- Profile Details Column -->
        <div class="col-lg-8">
          <div class="card mb-4" id="detailsCard">
            <div class="card-body">
              <!-- Name Field -->
              <div class="row mb-4">
                <div class="col-sm-3">
                  <p class="mb-0" id="nameDetails">Name</p>
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
                  <p class="mb-0" id="emailDetails">Email</p>
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
                  <p class="mb-0" id="passwordDetails">Password</p>
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
                        
                      </div>
                      <div class="d-flex justify-content-end gap-2">
                        <button 
                          class="btn btn-secondary" 
                          @click="cancelPasswordChange"
                          style="font-weight:bold;"
                        >
                          Cancel
                        </button>
                        <button 
                          class="btn btn-primary" 
                          @click="savePasswordChange"
                          style="background-color: #072d13; border: none; font-weight: bold;"
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
                  style="background-color: #072d13; border: none; font-weight:bold"
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
import { ref, computed, watchEffect, onMounted } from 'vue';
import { useAuthStore } from '@/store/authStore';
import { storeToRefs } from 'pinia';
import { db, auth } from '@/utils/firebase';
import { doc, getDocs, getDoc, updateDoc, collection, getFirestore } from 'firebase/firestore';
import { updatePassword, getAuth } from 'firebase/auth';

export default {
  name: 'UserProfile',

  // Fetching user plants logic
  data() {
    return {
      userPlants: [],
      loading: true, // Show loading state
    };
  },
  async mounted() {
    await this.fetchUserPlants();
  },
  methods: {
    async fetchUserPlants() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          console.error("❌ No authenticated user found.");
          return;
        }

        const db = getFirestore();
        const plantsRef = collection(db, "users", user.uid, "userPlants");
        const querySnapshot = await getDocs(plantsRef);

        this.userPlants = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("✅ Fetched user plants:", this.userPlants);
      } catch (error) {
        console.error("❌ Failed to fetch user plants:", error);
      } finally {
        this.loading = false;
      }
    },
  },
  
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

    const showToast = (message, type = 'info') => {
      toastMessage.value = message;
      toastType.value = type;
      setTimeout(() => {
        toastMessage.value = '';
      }, 3000);
    }
   // KENDRICK - switched isEditing fields to true
    const isEditing = ref({
      name: true,
      email: true,
      password: true
    });

    const showPassword = ref(false);

    // KENDRICK - edited originalData to match user data initially
    const originalData = ref({
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
   
  
  // KENDRICK = Edited toggleEdit with if statement
    const toggleEdit = (field) => {
    isEditing.value[field] = !isEditing.value[field];
      if (!isEditing.value[field]) {
        originalData.value[field] = userData.value[field];
      }
    };
    // ✅ Load user profile from Firestore
  const loadUserProfile = async () => {
    if (!user.value) {
      console.log("No user value available");
      return;
    }
    try {
      const userDocRef = doc(db, 'users', user.value.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userDataFromDB = userDocSnap.data();
        userData.value.name = userDataFromDB.name || '';
        userData.value.email = user.value.email || '';
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

    onMounted(async () => {
      if (!user.value) {
        await authStore.fetchUserProfile();
      } else {
        await loadUserProfile();
      }
    });
    const hasChanges = computed(() => {
    return userData.value.name !== originalData.value?.name || 
    userData.value.email !== originalData.value.email;
  });

  // ✅ Save changes (Name, Profile Image)
  const saveChanges = async () => {


    if (!user.value) return;

    try {
      const userDocRef = doc(db, 'users', user.value.uid);
      await updateDoc(userDocRef, { name: userData.value.name });

      showToast('Profile updated successfully!', 'success');
      originalData.value = { ...userData.value };
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Error updating profile', 'error');
    }
  };

  // KENDRICK CHANGE - added handleSignOut to add functionality to new
  // sign out button on user profile
    // 🔹 Handle user sign-out
  const handleSignOut = async () => {
  await authStore.logout();
  router.push('/login');
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

        showToast('Profile image updated successfully!', 'success');
      } catch (error) {
        console.error('Error updating profile image:', error);
        showToast('Error updating profile image', 'error');
      }
    };

    reader.readAsDataURL(file);
  };
  
  // ✅ Save Password Change
  const savePasswordChange = async () => {
    
    if (userData.value.newPassword !== userData.value.confirmPassword) {
      
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      const userAuth = auth.currentUser;
      if (!userAuth) throw new Error('User not logged in');

      await updatePassword(userAuth, userData.value.newPassword);
      showToast('Password changed successfully!', 'success');

      cancelPasswordChange();
    } catch (error) {
      console.error('Error changing password:', error);
      showToast('Error changing password', 'error');
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
    cancelPasswordChange,
    toggleEdit,// KENDRICK - added toggleEdit to return section
    handleSignOut, // KENDRICK CHANGE - added handleSignOut
    authStore // KENDRICK CHANGE - added authStore
  

    };
  }
}


</script>


<style scoped>

/* Plant Card Styling */
/* Plants container styling */

/* Add this to your <style scoped> section */

.toast-popup {
  position: fixed;
  top: 24px; /* 🔁 changed from bottom */
  left: 50%;
  transform: translateX(-50%);
  background-color: #323232;
  color: #fff;
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  font-size: 0.95rem;
  z-index: 9999;
  opacity: 0.95;
  animation: toastSlideDown 0.3s ease-out;
}


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

 

 
 .top-navigation {
  position: absolute;
  top: 20px;
  left: 20px;
  background-color: #341c02; /* Brown background */
  padding: 8px 15px;
  border-radius: 5px;
  z-index: 10;
}

.breadcrumb {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item:not(:last-child)::after {
  margin: 0 10px;
  color: #F5E6D3; /* Cream color for the separator */
}

.breadcrumb-item a {
  color: #F5E6D3; /* Cream color for the text */
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

/* Override any default margins/transforms that might be centering the element */


@media (max-width: 768px) {
  #profile-nav {
    width: 100%;
  }
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

/* Profile Image Styling */
.profile-image-container {
  padding: 20px 0;
  height: 100%;
}

.profile-image-circle {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  border: 3px solid #341c02; /* Brown border */
  overflow: hidden;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0; /* Light gray background for placeholder */
  border-width: 5px;
} 

.profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-text {
  color: #341c02; /* Brown text */
  font-weight: 500;
  font-size: 16px;
}

.upload-button-circle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #341c02; /* Brown background */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  border: 2px solid #F5E6D3; /* Cream-colored border */
}

.plus-icon {
  color: #F5E6D3; /* Cream-colored plus sign */
  font-size: 24px;
  font-weight: bold;
  line-height: 1;
  margin-top: -2px; /* Slight adjustment for vertical centering */
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .profile-image-container {
    margin-bottom: 30px;
  }
}


p#nameDetails {
  font-weight: bold;
  color: #072d13;
}


p#passwordDetails {
  font-weight: bold;
  color: #072d13;
}

p#emailDetails {
  font-weight: bold;
  color: #072d13;
}

div#detailsCard {
  border-width: 3px;
  border-color: #341c02;
}

#addButtonProfile {
  text-decoration: none;
  color: white;
}


</style>