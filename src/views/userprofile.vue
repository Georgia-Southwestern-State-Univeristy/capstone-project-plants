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

<!-- Plants Section -->
<div class="col-12 mt-4">
  <div class="card" style="border-width: 2px; border-color: #341c02;">
    <div class="card-body">
      <!-- Plants Heading -->
      <h3 style="color: #072d13; font-weight: bold; margin-bottom: 20px;">Your Plants</h3>
      
      <!-- Add Plant Button -->
      <div class="mb-3">
        <button class="btn add-plant-btn">
          <span><router-link to='/add' id="addButtonProfile">Add a new plant</router-link></span>
        </button>
      </div>
      
      <!-- Plants List Container (will expand with new plants) -->
      <!-- Plants List Container -->
<div class="plants-container row">
  <!-- Plant Cards -->
  <div v-if="plants.length === 0" class="text-center text-muted py-4">
    <p>No plants added yet. Add your first plant to get started!</p>
  </div>
  
  <div v-for="plant in plants" :key="plant.id" class="col-md-6 col-lg-4 mb-4">
    <div class="plant-card">
      <div class="plant-image">
        <img 
          :src="plant.image || '/path/to/default-plant.jpg'" 
          alt="Plant image" 
          class="img-fluid"
        />
      </div>
      <div class="plant-title">
        {{ plant.name }}
      </div>
      <div class="plant-subtitle">
        {{ plant.type }}
      </div>
      <div class="plant-actions">
        <button class="btn btn-sm action-btn">
          Water
        </button>
        <span class="spacer"></span>
        <button class="btn btn-sm toggle-btn" @click="togglePlantDetails(plant.id)">
          <i :class="expandedPlants.includes(plant.id) ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
        </button>
      </div>
      <div class="plant-details" :class="{ 'expanded': expandedPlants.includes(plant.id) }">
        <hr>
        <div class="details-content">
          <p><strong>Last Watered:</strong> {{ formatDate(plant.lastWatered) }}</p>
          <p><strong>Watering Schedule:</strong> Every {{ plant.wateringSchedule.frequency }}</p>
          <p><strong>Health Status:</strong> {{ plant.healthStatus }}</p>
          <p v-if="plant.notes"><strong>Notes:</strong> <span v-html="plant.notes"></span></p>
        </div>
      </div>
    </div>
  </div>
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
   
// KENDRICK CHANGE - I added these script code snippets for the cards in the plant collection

   // Add these to your setup() function
const plants = ref([]);
const expandedPlants = ref([]);

// Function to toggle plant details visibility
const togglePlantDetails = (plantId) => {
  if (expandedPlants.value.includes(plantId)) {
    expandedPlants.value = expandedPlants.value.filter(id => id !== plantId);
  } else {
    expandedPlants.value.push(plantId);
  }
};

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Load user plants from Firestore
const loadUserPlants = async () => {
  if (!user.value?.uid) return;

  try {
    const plantsRef = collection(db, 'users', user.value.uid, 'plants');
    const querySnapshot = await getDocs(plantsRef);
    
    const plantsList = [];
    querySnapshot.forEach((doc) => {
      plantsList.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    plants.value = plantsList;
  } catch (error) {
    console.error('Error loading plants:', error);
  }
};

// Watch for user changes and load plants
watchEffect(() => {
  if (user.value?.uid) {
    loadUserPlants();
  }
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
      cancelPasswordChange,
      toggleEdit,// KENDRICK - added toggleEdit to return section

      // KENDRICK CHANGE - added function

      plants, 
      expandedPlants,
      togglePlantDetails,
      formatDate

      };
    }
  }


</script>


<style scoped>

/* Plant Card Styling */
.plants-container {
  margin-top: 20px;
}

.plant-card {
  background-color: #F5E6D3;
  border: 2px solid #341c02;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.plant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.plant-image {
  height: 200px;
  overflow: hidden;
}

.plant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.plant-image img:hover {
  transform: scale(1.05);
}

.plant-title {
  padding: 12px 16px 0 16px;
  font-size: 18px;
  font-weight: bold;
  color: #341c02;
}

.plant-subtitle {
  padding: 0 16px 12px 16px;
  font-size: 14px;
  color: #5a3a1a;
}

.plant-actions {
  padding: 0 16px 12px 16px;
  display: flex;
  align-items: center;
}

.action-btn {
  background-color: #341c02;
  color: #F5E6D3;
  border-radius: 16px;
  padding: 4px 12px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #5a3a1a;
  transform: translateY(-2px);
}

.spacer {
  flex: 1;
}

.toggle-btn {
  background: none;
  border: none;
  color: #341c02;
  cursor: pointer;
}

.toggle-btn:hover {
  color: #5a3a1a;
}

.plant-details {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.plant-details.expanded {
  max-height: 500px;
}

.plant-details hr {
  margin: 0;
  border-color: #341c02;
}

.details-content {
  padding: 16px;
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

/* Plants section styling */
.add-plant-btn {
  background-color: #072d13;
  color: white;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  transition: all 0.2s;
}

.add-plant-btn:hover {
  background-color: #0a5623;
  transform: translateY(-2px);
}

.plants-container {
  min-height: 100px;
  width: 100%;
}

/* Responsive design for plants section */
@media (max-width: 768px) {
  h3 {
    font-size: 1.5rem;
  }
  
  .add-plant-btn {
    width: 100%;
  }
}

#addButtonProfile {
  text-decoration: none;
  color: white;
}


</style>