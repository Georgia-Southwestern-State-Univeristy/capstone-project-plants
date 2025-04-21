<template>
  <div class="profile-page">
    <div class="profile-background">
      <!-- Toast -->
      <div v-if="showToast" :class="['toast-popup', toastType]">
        {{ toastMessage }}
      </div>

      <!-- Navigation -->
      <section>
        <div class="container py-5">
          <div class="top-navigation mb-4">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li class="breadcrumb-item"><router-link to="/chat">Chat</router-link></li>
                <li class="breadcrumb-item"><router-link to="/plantboard">Go to Plant Gallery</router-link></li>
                <li class="breadcrumb-item"><router-link to="/login">Sign Out</router-link></li>
              </ol>
            </nav>
          </div>

          <div class="card shadow p-4" style="background-color: #F5E6D3;">
            <!-- Profile Header -->
            <div class="text-center mb-4">
              <div class="position-relative d-inline-block">
                <div class="profile-image-circle" :class="{ 'has-image': profileImage }">
                  <img v-if="profileImage" :src="profileImage" alt="Profile" class="profile-img" />
                  <div v-else class="placeholder-text">Add image</div>
                </div>
                <label class="upload-button-circle" for="profile-upload">
                  <span class="plus-icon">+</span>
                  <input
                    id="profile-upload"
                    type="file"
                    class="d-none"
                    accept="image/*"
                    @change="handleImageUpload"
                  />
                </label>
              </div>
              <h4 class="mt-3 mb-1">{{ userData.name || 'Your name' }}</h4>
              <p class="text-muted small">{{ userData.email }}</p>
              <p class="text-sm text-gray-500" v-if="createdAt">
                🕒 Member since: {{ new Date(createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) }}
              </p>
            </div>


            <!-- Editable Fields -->
            <div class="card-body p-0">
              <!-- name -->
              <div class="row mb-3">
                <div class="col-sm-3"><strong>Name</strong></div>
                <div class="col-sm-9">
                  <div class="d-flex align-items-center">
                    <div v-if="isEditing.name" class="w-100">
                      <input
                        v-model="userData.name"
                        type="text"
                        placeholder="Name"
                        class="form-input-underline"/>
                    </div>
                    <p v-else class="mb-0 text-muted">
                      {{ userData.name }}
                      <i class="fas fa-pen ms-2" @click="toggleEdit('name')" style="cursor: pointer; color: #072d13;"></i>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="row mb-3">
                <div class="col-sm-3"><strong>Email</strong></div>
                <div class="col-sm-9">
                  <div class="d-flex align-items-center">
                    <div v-if="isEditing.email" class="w-100">
                      <input
                        v-model="userData.email"
                        type="email"
                        placeholder="Email"
                        class="form-input-underline"
                      />
                    </div>
                    <p v-else class="mb-0 text-muted">
                      {{ userData.email }}
                      <i class="fas fa-pen ms-2" @click="toggleEdit('email')" style="cursor: pointer; color: #072d13;"></i>
                    </p>
                  </div>
                </div>
              </div>
              <!-- Email Notifications -->
<div class="row mb-3">
  <div class="col-sm-3"><strong>Notifications</strong></div>
  <div class="col-sm-9">
    <div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        id="emailNotifications"
        v-model="userData.emailNotifications"
      />
      <label class="form-check-label" for="emailNotifications">
        Enable email notifications
      </label>
    </div>
  </div>
</div>


              <!-- Password -->
              <!-- <div class="row mb-3">
                <div class="col-sm-3"><strong>Password</strong></div>
                <div class="col-sm-9">
                  <div class="d-flex align-items-center">
                    <div v-if="isEditing.password" class="w-100">
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        v-model="userData.currentPassword"
                        class="form-control mb-2"
                        placeholder="Current Password"
                      />
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        v-model="userData.newPassword"
                        class="form-control mb-2"
                        placeholder="New Password"
                      />
                      <input
                        :type="showPassword ? 'text' : 'password'"
                        v-model="userData.confirmPassword"
                        class="form-control mb-2"
                        placeholder="Confirm New Password"
                      />
                      <div class="d-flex justify-content-end gap-2">
                        <button class="btn btn-secondary fw-bold" @click="cancelPasswordChange">Cancel</button>
                        <button class="btn btn-primary fw-bold" @click="savePasswordChange" style="background-color: #072d13;">Update Password</button>
                      </div>
                    </div>
                    <p v-else class="mb-0 text-muted">
                      ********
                      <i class="fas fa-pen ms-2" @click="toggleEdit('password')" style="cursor: pointer; color: #072d13;"></i>
                    </p>
                  </div>
                </div>
              </div> -->

              <!-- Save Button -->
              <div class="d-flex justify-content-end mt-4">
                <button
                  @click="saveChanges"
                  class="btn btn-primary fw-bold"
                  :disabled="!hasChanges"
                  style="background-color: #072d13;"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, watchEffect, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/authStore';
import { storeToRefs } from 'pinia';
import { db, auth } from '@/utils/firebase';
import {
  doc, getDoc, updateDoc, getDocs, collection, getFirestore
} from 'firebase/firestore';
import { updatePassword, getAuth } from 'firebase/auth';

export default {
  name: 'UserProfile',
  setup() {
    const authStore = useAuthStore();
    const { user } = storeToRefs(authStore);
    const router = useRouter();

    // Refs
    const profileImage = ref(null);
    const toastMessage = ref('');
    const toastType = ref('');
    const userPlants = ref([]);
    const loading = ref(true);
    const createdAt = ref(null);

    const userData = ref({
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      username: ''
    });

    const isEditing = ref({
      name: true,
      email: true,
      password: true
    });

    const showPassword = ref(false);

    const originalData = ref({
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
    };

    const toggleEdit = (field) => {
      isEditing.value[field] = !isEditing.value[field];
      if (!isEditing.value[field]) {
        originalData.value[field] = userData.value[field];
      }
    };

    const loadUserProfile = async () => {
      if (!user.value) return;

      try {
        const userDocRef = doc(db, 'users', user.value.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userDataFromDB = userDocSnap.data();
          userData.value.name = userDataFromDB.name || '';
          userData.value.email = user.value.email || '';
          profileImage.value = userDataFromDB.profileImage || null;
          createdAt.value = userDataFromDB.createdAt || null; // ✅ set this
          originalData.value = { ...userData.value };
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchUserPlants = async () => {
      try {
        const db = getFirestore();
        const plantsRef = collection(db, "users", user.value.uid, "userPlants");
        const querySnapshot = await getDocs(plantsRef);

        userPlants.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log("✅ Fetched user plants:", userPlants.value);
      } catch (error) {
        console.error("❌ Failed to fetch user plants:", error);
      } finally {
        loading.value = false;
      }
    };

    onMounted(async () => {
      if (!user.value) {
        await authStore.fetchUserProfile();
      }
      await loadUserProfile();
      await fetchUserPlants();
    });

    watchEffect(() => {
      if (user.value) {
        loadUserProfile();
      }
    });

    const hasChanges = computed(() => {
      return userData.value.name !== originalData.value?.name ||
             userData.value.email !== originalData.value.email;
    });

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

    const handleImageUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const res = await fetch(`/api/users/profile/${user.value.uid}/avatar`, {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          profileImage.value = data.imageUrl;
          showToast("✅ Profile image updated!", "success");
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error("Image upload failed:", err);
        showToast("❌ Upload failed", "error");
      }
    };

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

    const handleSignOut = async () => {
      await authStore.logout();
      router.push('/login');
    };

    return {
      user,
      userData,
      profileImage,
      toastMessage,
      toastType,
      isEditing,
      showPassword,
      originalData,
      userPlants,
      loading,
      hasChanges,
      saveChanges,
      handleImageUpload,
      savePasswordChange,
      cancelPasswordChange,
      toggleEdit,
      handleSignOut,
      showToast,
      fetchUserPlants
    };
  }
};
</script>



<style scoped>

/* Plant Card Styling */
/* Plants container styling */

/* Add this to your <style scoped> section */

.profile-background {
  background-image: url('@/assets/profileBackground.png');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  min-height: 100vh;
  padding: 4rem 2rem;

  /* Remove the restrictive flex centering */
  display: block; /* ✅ use block instead of flex */
}

.profile-card {
  width: 50%;
  max-width: 800px; /* responsive width on all screens */
  background-color: rgba(255, 255, 255, 0.95);
  padding: 2.5rem 3rem;
  border-radius: 1rem;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  transition: max-width 0.3s ease;
}

/* 🔁 Mobile-first design: stack layout */
@media (max-width: 768px) {
  .profile-background {
    padding: 1rem;
    display: block;
  }

    .profile-card {
    width: 100%;
    max-width: 90vw; /* 🔁 or clamp for nicer scaling: */
    max-width: clamp(700px, 90vw, 1400px);
  }
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


.form-input-underline {
  width: 300px;
  padding: 6px 0;
  border: none;
  border-bottom: 2px solid #555;
  background: transparent;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-input-underline:focus {
  border-bottom-color: #2c6e49; /* your accent green */
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