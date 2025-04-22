<!-- plantboard.vue -->
<template>
  <div class="plantboard-container">
    <div v-if="toastMessage" :class="['toast-popup', toastType]">
      {{ toastMessage }}
    </div>

    <input
      v-model="searchQuery"
      type="text"
      placeholder="Search your plants..."
      class="form-input-underline"
    />

    
    <div class="header-section">
      <h1 class="your-plants-title">Your Plants</h1>
    </div>
    
    <div class="button-container">
      <button 
        class="add-plant-btn" 
        @click="toggleUploadForm"
      >
        + Add a new plant
      </button>
    </div>

    <!-- Plant Upload Form -->
    <div v-if="showUploadForm" class="upload-form-container">
      <div class="upload-form">
        <h3>Add a New Plant</h3>
        <div class="form-group">
          <label for="plantName">Plant Name</label>
          <input type="text" id="plantName" v-model="newPlant.name" class="form-control" placeholder="Enter plant name">
        </div>
        
        <div class="form-group">
          <label for="plantType">Plant Type</label>
          <input type="text" id="plantType" v-model="newPlant.type" class="form-control" placeholder="Enter plant type">
        </div>

        <div class="form-group">
        <label for="sunlightSchedule">Sunlight Schedule</label>
          <div class="select-wrapper">
            <select id="sunlightSchedule" v-model="newPlant.sunlight_schedule" class="form-control">
              <option disabled value="">-- Select sunlight level --</option>
              <option value="Full Sun">Full Sun (6+ hrs/day)</option>
              <option value="Partial Sun">Partial Sun (4–6 hrs/day)</option>
              <option value="Partial Shade">Partial Shade (2–4 hrs/day)</option>
              <option value="Full Shade">Full Shade (little to no direct sun)</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
        <label for="wateringSchedule">Watering Schedule</label>
          <div class="select-wrapper">
            <select id="wateringSchedule" v-model="newPlant.watering_schedule" class="form-control">
              <option disabled value="">-- Select watering frequency --</option>
              <option value="1">Every day</option>
              <option value="2">Every 2 days</option>
              <option value="3">Every 3 days</option>
              <option value="4">Every 4 days</option>
              <option value="5">Every 5 days</option>
              <option value="7">Once a week</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="lastWatered">Last Watered</label>
          <input type="date" id="lastWatered" v-model="newPlant.last_watered" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="healthStatus">Health Status</label>
          <div class="select-wrapper">
          <select id="healthStatus" v-model="newPlant.health_status" class="form-control">
            <option disabled value="">-- Select health status --</option>
            <option value="Healthy">Healthy</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
        </div>
        
        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" v-model="newPlant.notes" class="form-control" placeholder="Add notes about your plant"></textarea>
        </div>
        
        <div class="form-group">
          <label for="plantImage">Plant Image</label>
          <input type="file" id="plantImage" ref="fileInput" @change="handleImageChange" class="form-control">
          <div v-if="previewImage" class="image-preview">
            <img :src="previewImage" alt="Plant Preview">
          </div>
        </div>
        
        <div class="form-buttons">
          <button @click="savePlant" class="btn-save">Save Plant</button>
          <button @click="toggleUploadForm" class="btn-cancel">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Plants Gallery Grid -->
    <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div 
        v-for="(plant, index) in filteredPlants" 
        :key="index" 
        class="col"
      >

      <div class="card" :class="{ expanded: expandedCardIndex === index }">
  <!-- Single shared image always on top -->
        <div class="plant-card-front" @click="toggleCardDetails(index)">
          <img :src="plant.image_url || '/default-plant.jpg'" class="card-img-top" alt="Plant Image" />
          <div v-if="expandedCardIndex !== index" class="overlay-content">
            <h5 class="overlay-title">{{ plant.name }}</h5>
            <p class="overlay-subtitle">Click for more</p>
          </div>
        </div>

        <!-- Slide-reveal content below image -->
        <transition name="slide-reveal">
          <div v-if="expandedCardIndex === index" class="plant-card-back slide-body-wrapper">
            <div class="card-body-with-waterbar">
              <div class="water-bar-wrapper">
                <div class="water-bar-vertical">
                  <div
                    class="water-bar-fill"
                    :style="{
                      height: waterLevels[index] + '%',
                      backgroundColor: waterLevels[index] > 50 ? '#4fc3f7' :
                                      waterLevels[index] > 25 ? '#fdd835' : '#e53935'
                    }"
                  ></div>
                </div>
              </div>

              <div class="plant-details-container">
                <h5 class="card-title">{{ plant.name }}</h5>
                <p class="plant-info"><span class="detail-emoji">🌿</span> <span class="detail-label">Type:</span> {{ plant.type }}</p>
                <p class="plant-info"><span class="detail-emoji">☀️</span> <span class="detail-label">Sunlight:</span> {{ plant.sunlight_schedule }}</p>
                <p class="plant-info"><span class="detail-emoji">💧</span> <span class="detail-label">Watering:</span> {{ plant.watering_schedule }}</p>
                <p class="plant-info"><span class="detail-emoji">📅</span> <span class="detail-label">Last watered:</span> {{ formatDate(plant.last_watered) }}</p>
                <p class="plant-info"><span class="detail-emoji">❤️</span> <span class="detail-label">Health:</span> {{ plant.health_status }}</p>
                <p class="plant-info"><span class="detail-emoji">📝</span> <span class="detail-label">Notes:</span> {{ plant.notes || 'No notes added yet.' }}</p>
              </div>
            </div>

            <div class="card-footer">
              <button @click.stop="markWatered(index)" class="water-today-btn">💧 Water</button>
              <div class="button-group">
                <button @click.stop="editPlant(index)" class="btn-edit">Edit</button>
                <button @click.stop="requestDelete(index)" class="btn-delete">Delete</button>
              </div>
            </div>

            <div v-if="confirmDeleteIndex === index" class="delete-confirm-overlay">
              <p>Are you sure you want to delete this plant?</p>
              <div class="delete-confirm-buttons">
                <button class="btn-delete" @click="deletePlant(index)">Yes, Delete</button>
                <button class="btn-cancel" @click="cancelDelete">Cancel</button>
              </div>
            </div>
          </div>
        </transition>
      </div>
      </div>
    </div>
    <!-- No Matches Found -->
  <div v-if="filteredPlants.length === 0 && searchQuery.trim()" class="empty-state">
    <p>🔍 No plants found matching "{{ searchQuery }}".</p>
  </div>


    <!-- Empty State Message -->
    <div v-if="plants.length === 0" class="empty-state">
      <p>You haven't added any plants yet. Click the "Add a new plant" button to get started!</p>
    </div>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/utils/firebase'; 



export default {
  name: 'plantBoard',
  data() {
  return {
    plants: [],
    showUploadForm: false,
    expandedCardIndex: null,
    previewImage: null,
    editingIndex: null,
    confirmDeleteIndex: null, 
    searchQuery: '',
    userPlants: [],
    toastMessage: '',
    toastType: 'info', // success | error | warning
    newPlant: {
      name: '',
      type: '',
      sunlight_schedule: '',
      watering_schedule: '',
      last_watered: '',
      health_status: 'Healthy',
      notes: '',
      image: null,
      image_url: ''
    }
  };
},



  mounted() {
    // Load existing plants from database
    this.loadPlants();

    document.addEventListener('click', this.handleOutsideClick);
    },
    beforeUnmount() {
      document.removeEventListener('click', this.handleOutsideClick);
    },

  computed: {
    waterLevels() {
      return this.plants.map(plant => {
        const lastWatered = new Date(plant.last_watered);
        const today = new Date();
        const schedule = Number(plant.watering_schedule) || 3;

        const daysSince = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
        const percent = Math.max(0, 100 - (daysSince / schedule) * 100);
        return Math.round(Math.min(percent, 100));
      });
    },
    filteredPlants() {
      if (!this.searchQuery || !this.plants || this.plants.length === 0) {
        return this.plants; // ✅ return full list if nothing typed yet
      }

      const query = this.searchQuery.toLowerCase();
      return this.plants.filter(plant =>
        plant.name.toLowerCase().includes(query)
      );
    }
  },

  methods: {
    calculateWaterLevel(plant) {
    console.log("🌱 Last watered:", plant.last_watered);
    const lastWatered = new Date(plant.last_watered);
    const today = new Date();
    const schedule = Number(plant.watering_schedule) || 3;

    const daysSince = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
    const percent = Math.max(0, 100 - (daysSince / schedule) * 100);
    return Math.round(Math.min(percent, 100));
   },
    toggleCardDetails(index) {
      setTimeout(() => {
    this.expandedCardIndex = index;
    }, 0); // wait one tick
    },
    
    closeCardDetails() {
      this.expandedCardIndex = null;
    },

    requestDelete(index) {
      this.confirmDeleteIndex = index;
    },
    cancelDelete() {
      this.confirmDeleteIndex = null;
    },
    showToast(message, type = 'info') {
      this.toastMessage = message;
      this.toastType = type;

      setTimeout(() => {
        this.toastMessage = '';
      }, 3000);
    },

    showCardMessage(index, message) {
      this.$set(this.notificationMessages, index, message);
      setTimeout(() => {
        this.$set(this.notificationMessages, index, '');
      }, 3000);
    },

    handleOutsideClick(event) {
      const backCards = document.querySelectorAll('.plant-card-back');
      const frontCards = document.querySelectorAll('.plant-card-front');

      for (const card of [...backCards, ...frontCards]) {
        if (card.contains(event.target)) {
          return; // click was inside a card
        }
      }

      this.expandedCardIndex = null;
    },

    
    async loadPlants() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          console.warn("User not logged in");
          return;
        }

        const userPlantsRef = collection(db, "users", user.uid, "userPlants");
        const snapshot = await getDocs(userPlantsRef);

        const firebasePlants = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.plantName || "Unknown",
            type: data.scientificName || "Unknown",
            sunlight_schedule: data.sunlight_schedule || "Unknown",
            watering_schedule: data.wateringSchedule || "Unknown",
            last_watered: data.lastWatered || new Date().toISOString(),  
            health_status: "Healthy",  // default for now
            notes: data.commonIssues || "",
            image_url: data.imageUrl || "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80",
          };
        });

        this.plants = firebasePlants;
        this.notificationMessages = firebasePlants.map(() => '');
      } catch (error) {
        console.error("❌ Failed to load plants from Firestore:", error);
      }
    },

    /// Function to update the last watered date in Firebase
    async markWatered(index) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          this.showToast("⚠️ Login required.", "warning");
          return;
        }

        const plantId = this.plants[index].id;
        const response = await fetch(`/api/plants/users/${user.uid}/plants/${plantId}/water`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken: await user.getIdToken() }),
        });

        const result = await response.json();

        if (result.success) {
          this.plants[index].last_watered = new Date().toISOString();
          this.showToast("💧 Watered successfully", "success");

          // ✅ Animate water bar
          this.$nextTick(() => {
            const bar = document.querySelectorAll('.water-bar-vertical')[index];
            if (bar) {
              const currentFill = parseFloat(bar.style.getPropertyValue('--water-fill')) || 0;
              const targetFill = this.calculateWaterLevel(this.plants[index]);

              bar.style.setProperty('--water-fill', `${currentFill}%`); // Reset to current
              void bar.offsetHeight; // Force reflow

              requestAnimationFrame(() => {
                bar.style.setProperty('--water-fill', `${targetFill}%`); // Animate to new level
              });
            }
          });
        } else {
          console.error('❌ Failed to water:', result.error);
          this.toastMessage = "❌ Failed to water. Please try again.";
        }
      } catch (error) {
        console.error('❌ Error watering plant:', error);
        this.toastMessage = "❌ An error occurred while watering the plant.";
      }
    },


    toggleUploadForm() {
      this.showUploadForm = !this.showUploadForm;
      if (!this.showUploadForm) {
        this.resetForm();
      }
    },
    handleImageChange(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      // Create preview
      this.previewImage = URL.createObjectURL(file);
      this.newPlant.image = file;
    },
    resetForm() {
      this.newPlant = {
        name: '',
        type: '',
        sunlight_schedule: '',
        watering_schedule: '',
        last_watered: '',
        health_status: 'Healthy',
        notes: '',
        image: null,
        image_url: ''
      };
      this.previewImage = null;
      this.editingIndex = null;
      
      // Reset file input
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },

    async savePlant() {
      if (!this.newPlant.name) {
        this.showToast("⚠️ Plant name is required.", "warning");
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        this.showToast("⚠️ Login required.", "warning");
        return;
      }

      try {
        let res;

        if (this.editingIndex !== null) {
          // ✅ EDITING an existing plant
          const plantId = this.plants[this.editingIndex].id;

          res = await fetch(`/api/plants/users/${user.uid}/plants/${plantId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              idToken: await user.getIdToken(),
              plantName: this.newPlant.name,
              scientificName: this.newPlant.type,
              sunlight: this.newPlant.sunlight_schedule,
              wateringSchedule: this.newPlant.watering_schedule,
              lastWatered: this.newPlant.last_watered || new Date().toISOString(),
              health_status: this.newPlant.health_status,
              notes: this.newPlant.notes || "",
              imageUrl: this.newPlant.image_url
            }),
          });

        } else {
          // ✅ ADDING a new plant
          const formData = new FormData();
          formData.append("plantName", this.newPlant.name);
          formData.append("scientificName", this.newPlant.type);
          formData.append("sunlight", this.newPlant.sunlight_schedule);
          formData.append("wateringSchedule", this.newPlant.watering_schedule);
          formData.append("lastWatered", this.newPlant.last_watered || new Date().toISOString());
          formData.append("health_status", this.newPlant.health_status);
          formData.append("notes", this.newPlant.notes || "");
          formData.append("idToken", await user.getIdToken());

          if (this.newPlant.image) {
            formData.append("image", this.newPlant.image);
          }

          res = await fetch("/api/chat/add-plant", {
            method: "POST",
            body: formData
          });
        }

        const result = await res.json();

        if (result.success) {
          this.toastMessage = this.editingIndex !== null ? "✅ Plant updated successfully!" : "✅ Plant added successfully!";
          setTimeout(() => {
            this.toastMessage = '';
          }, 3000);
          this.resetForm();
          this.showUploadForm = false;
          this.editingIndex = null;
          this.loadPlants();
        } else {
          throw new Error(result.error || "Unknown error");
        }

      } catch (error) {
        console.error("❌ Failed to save plant:", error);
        this.toastMessage = "❌ Failed to save plant. Please try again.";
      }
    },



    async deletePlant(index) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          this.toastMessage = "⚠️ Login required.";
          return;
        }

        const plantId = this.plants[index].id;

        const res = await fetch(`/api/plants/users/${user.uid}/plants/${plantId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: await user.getIdToken(),
            plantId: plantId
          }),
        });

        const result = await res.json();

        if (result.success) {
          this.plants.splice(index, 1);
          this.notificationMessages.splice(index, 1);
          this.confirmDeleteIndex = null;
          this.showToast("✅ Plant deleted successfully!", "success");
        } else {
          this.toastMessage = "❌ Failed to delete plant. Please try again.";
        }
      } catch (error) {
        console.error("❌ Delete error:", error);
        this.toastMessage = "❌ An error occurred while deleting the plant.";
      }
    },

    editPlant(index) {
      const plant = this.plants[index];
      this.newPlant = { ...plant };
      this.previewImage = plant.image_url;
      this.editingIndex = index;
      this.showUploadForm = true;
    },
    formatDate(dateString) {
      if (!dateString) return 'Not recorded';
      
      const date = new Date(dateString);
      return date.toLocaleDateString();
    }
  }
}
</script>

<style scoped>

/* Custom select with chevron styling */
.select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}



.form-input-underline {
  width: 100%;
  padding: 6px 0;
  border: none;
  border-bottom: 3px solid #4f2e15;
  background: transparent;
  outline: none;
  font-size: 1rem;
  margin-bottom: 1rem;
  margin-top: 40px;
}

.form-input-underline:focus {
  border-bottom-color: #9ef09e;
}


.select-wrapper::after {
  content: '\25BC'; /* Unicode for downward triangle */
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  pointer-events: none; /* Allows clicks to pass through to select */
  font-size: 12px; /* Small chevron size */
  color: black;
}

/* Style the select to make room for the chevron */
.select-wrapper select {
  appearance: none; /* Remove default arrow in modern browsers */
  -webkit-appearance: none; /* For Safari */
  -moz-appearance: none; /* For Firefox */
  padding-right: 30px; /* Make room for the custom arrow */
  cursor: pointer;
}

/* Hide default dropdown arrow in IE10+ */
.select-wrapper select::-ms-expand {
  display: none;
}


/* Fix for the file input to prevent button cutoff */
.form-group input[type="file"] {
  padding: 20px;
  width: 100%;
  overflow: hidden;
}

/* Style just the "Choose file" button part */
.form-group input[type="file"]::file-selector-button {
  background-color: #072d13; /* Green button */
  color: white; /* White text */
  border: 1px solid white;
  border-radius: 5px;
  padding: 8px 12px;
  margin-right: 16px; /* Add more space after button */
  cursor: pointer;
  font-weight: bold;
}


.plantboard-container {
  background-color: #072d13;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  padding: 30px;
  position: relative;
}


.plantboard-container .row {
  margin-left: 0;
  margin-right: 0;
  width: 100%;
}



.breadcrumb {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;

}

.breadcrumb-link {
  color: #072d13;
  text-decoration: none;
  font-weight: bold;
}

.breadcrumb-link:hover {
  text-decoration: underline;
}

.header-section {
  margin-top: 60px;
  margin-bottom: 30px;
}

.your-plants-title {
  color: white;
  font-size: 2rem;
  margin: 0;
  font-weight: bold;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
}

.add-plant-btn {
  background-color: white;
  color: #072d13;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.add-plant-btn:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

/* Upload Form Styles */
.upload-form-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.upload-form {
  background-color: white;
  padding: 30px;
  border-radius: 5px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #072d13 transparent;
}



.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #072d13;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.image-preview {
  margin-top: 10px;
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: 5px;
}

.form-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.btn-save, .btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-save {
  background-color: #072d13;
  color: white;
}

.btn-cancel {
  background-color: #a2a6a3;
  color: #333;
}

/* MDBootstrap Style Cards with fixed dimensions */
.row {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
  margin-left: 0;
  margin-right: 0;
  justify-content: flex-start;
}

.col {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 0 15px;
  margin-bottom: 30px;
}

/* Ensure proper 3-column grid */
/* Let Bootstrap handle responsive column sizes via classes */
.row.row-cols-1.row-cols-md-2.row-cols-lg-3.g-4 > .col {
  padding-left: 15px;
  padding-right: 15px;
  margin-bottom: 30px;
}


/* Adjust padding on columns to prevent overflow */
.row.row-cols-1.row-cols-md-2.row-cols-lg-3.g-4 {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  margin: 0;
}

/* Fixed card dimensions */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 500px; 
  min-width: 0;
  word-wrap: break-word;
  background-clip: border-box;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  overflow: hidden;
  background-color: transparent;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.card.expanded {
  transform: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.plant-card-front {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
  display: flex; /* Added for better centering */
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically */
}

.plant-card-front img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
  border-radius: 0.5rem;
}

.overlay-content {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 15px; /* Slightly reduced padding */
  text-align: center;
  box-sizing: border-box; /* Include padding in width calculation */
}

.overlay-title {
  color: white;
  font-size: clamp(1rem, 5vw, 1.75rem); /* Responsive font size */
  margin-bottom: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  word-wrap: break-word; /* Allow text to wrap */
  overflow-wrap: break-word;
  max-width: 100%; /* Ensure text doesn't exceed container width */
  padding: 0 10px; /* Add some horizontal padding */
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Limit to 2 lines if very long */
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
}

.overlay-subtitle {
  color: white;
  font-size: clamp(0.75rem, 3vw, 1rem); /* Responsive font size */
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.plant-card-back {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.4s ease-in-out;
}

.slide-body-wrapper {
  overflow: hidden;
}

/* Transition classes for slide-reveal */
.slide-reveal-enter-active,
.slide-reveal-leave-active {
  transition: max-height 0.6s ease, opacity 0.5s ease;
}

.slide-reveal-enter-from,
.slide-reveal-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-reveal-enter-to,
.slide-reveal-leave-from {
  max-height: 600px; /* or adjust as needed */
  opacity: 1;
}



.card-img-top {
  width: 100%;
  height: 180px; /* Fixed height for images */
  object-fit: cover;
}

/* .close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.5);
} */

.card-body {
  flex: 1 1 auto;
  padding: 0.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-title {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #072d13;
}

.card-body-with-waterbar {
  margin-top: 3%;
  margin-left: 1.5%;
  display: flex;
  flex-direction: row;
  gap: 12px;
  height: 100%;
  overflow: hidden;
}

/* Sidebar bar wrapper remains top-aligned */
.water-bar-wrapper {
  padding-top: 10px;
}

/* Actual fill bar inside the wrapper */
.water-bar-vertical {
  width: 8px;
  height: 200px;
  background-color: #e0e0e0;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
}

.water-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  border-radius: 5px;
  transition: height 0.6s ease-in-out;
}

.water-bar-vertical.animate {
  animation: riseWater 0.6s ease-out forwards;
}

.plant-details-container {
  flex: 1;
  overflow-y: auto;
  max-height: 250px;
  padding-right: 6px;

  scrollbar-width: thin;
  scrollbar-color: #072d13 transparent;
}
/* For Webkit browsers (Chrome, Safari, etc.) */
.plant-details-container::-webkit-scrollbar {
  width: 5px;
}

.plant-details-container::-webkit-scrollbar-track {
  background: transparent;
}

.plant-details-container::-webkit-scrollbar-thumb {
  background-color: #072d13;
  border-radius: 10px;
}

.plant-info {
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #333;
}

.detail-emoji {
  margin-right: 5px;
}

.detail-label {
  font-weight: bold;
  color: #072d13;
}

/* Card footer ===================================== */
.card-footer {
  padding: 0.4rem 0.75rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.125);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Water Button (left aligned, no black border, smooth styling) */
.water-today-btn {
  padding: 8px 16px;
  background-color: #03a9f4;
  color: white;
  font-size: 0.9rem;
  font-weight: bold;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: none; /* remove unwanted shadow or outline */
}

.water-today-btn:hover {
  background-color: #039be5;
}

.delete-confirm-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(3px);
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 10;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 20px;
  border-radius: 10px;
}

.delete-confirm-buttons {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-cancel {
  background-color: #ccc;
  color: #333;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-cancel:hover {
  background-color: #aaa;
}


/* Edit/Delete Group (right aligned, smaller and compact) */
.button-group {
  display: flex;
  gap: 6px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  font-size: 0.85rem;
  border-radius: 6px;
  font-weight: bold;
  border: none;
  white-space: nowrap;
}

/* Edit button */
.btn-edit {
  background-color: #072d13;
  color: white;
}

.btn-edit:hover {
  background-color: #0a3b1a;
}

/* Delete button */
.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  background-color: #c82333;
}

/* Card footer ===================================== */
/* Empty State */
.empty-state {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  margin-top: 30px;
  color: white;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(-5px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; }
  100% { opacity: 0; transform: translateY(-5px); }
}

@keyframes toastSlideDown {
  from {
    transform: translateX(-50%) translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 0.95;
  }
}
/* Responsive styles */
@media (max-width: 991.98px) {
  .row-cols-md-3 > .col {
    flex: 0 0 50%;
    max-width: 50%;
  }
}


@media (max-width: 768px) {
  .row-cols-md-2 > .col {
    flex: 0 0 100%;
    max-width: 100%;
  }
  

  
  .header-section {
    margin-top: 20px;
  }
  
  .your-plants-title {
    font-size: 1.7rem;
  }
  
  .card {
    height: 380px; /* Slightly smaller cards on mobile */
  }
}


@media (min-width: 992px) {
  .col {
    flex: 0 0 calc(33.333333% - 30px);
    max-width: calc(33.333333% - 30px);
    width: calc(33.333333% - 30px);
  }
}

/* Increase space for plant details */
.plant-details-container {
  max-height: 210px; /* More space for details */
}

@media (max-width: 480px) {
  .plantboard-container {
    padding: 15px;
  }
  
  .col {
    padding: 0 10px;
  }
}
@media (max-width: 768px) {
  .row-cols-md-2 > .col,
  .row-cols-lg-3 > .col {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}

</style>