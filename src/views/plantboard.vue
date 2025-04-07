<!-- plantboard.vue -->
<template>
  <div class="plantboard-container">
    <div class="top-navigation">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><router-link to="/chat" class="breadcrumb-link">Chat</router-link></li>
          <li class="breadcrumb-item"><router-link to="/userprofile" class="breadcrumb-link">Account</router-link></li>
          <li class="breadcrumb-item"><router-link to="/login" class="breadcrumb-link">Sign Out</router-link></li>
        </ol>
      </nav>
    </div>
    
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
          <input type="text" id="sunlightSchedule" v-model="newPlant.sunlight_schedule" class="form-control" placeholder="How often should the plant be left in sunlight each day?">
        </div>
        
        <div class="form-group">
          <label for="wateringSchedule">Watering Schedule</label>
          <input type="text" id="wateringSchedule" v-model="newPlant.watering_schedule" class="form-control" placeholder="How often should the plant be watered each day?">
        </div>
        
        <div class="form-group">
          <label for="lastWatered">Last Watered</label>
          <input type="date" id="lastWatered" v-model="newPlant.last_watered" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="healthStatus">Health Status</label>
          <div class="select-wrapper">
          <select id="healthStatus" v-model="newPlant.health_status" class="form-control">
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
        v-for="(plant, index) in plants" 
        :key="index" 
        class="col"
      >
        <div class="card" :class="{'expanded': expandedCardIndex === index}">
          <!-- Card Front (Image with overlay) -->
          <div class="plant-card-front" v-if="expandedCardIndex !== index" @click="toggleCardDetails(index)">
            <img :src="plant.image_url || '/default-plant.jpg'" class="card-img-top" alt="Plant Image">
            <div class="overlay-content">
              <h5 class="overlay-title">{{ plant.name }}</h5>
              <p class="overlay-subtitle">Click for more</p>
            </div>
          </div>
          
          <!-- Card Back (Details) -->
          <div class="plant-card-back" v-if="expandedCardIndex === index">
            <img :src="plant.image_url || '/default-plant.jpg'" class="card-img-top" alt="Plant Image">
            <button class="close-btn" @click.stop="closeCardDetails(index)">×</button>
            
            <div class="card-body">
              <h5 class="card-title">{{ plant.name }}</h5>
              <!-- Water Level Visual -->
              <div class="water-bar-container">
                <div
                  class="water-bar"
                  :style="{
                    width: waterLevels[index] + '%',
                    backgroundColor: waterLevels[index] > 50
                      ? '#4fc3f7'
                      : (waterLevels[index] > 25 ? '#fdd835' : '#e53935')
                  }"
                  :title="'Water level: ' + calculateWaterLevel(plant) + '%'"
                ></div>
              </div>

              <div class="plant-details-container">
                
                <p class="plant-info"><span class="detail-emoji">🌿</span> <span class="detail-label">Type:</span> {{ plant.type }}</p>
                <p class="plant-info"><span class="detail-emoji">☀️</span> <span class="detail-label">Sunlight:</span> {{ plant.sunlight_schedule }}</p>
                <p class="plant-info"><span class="detail-emoji">💧</span> <span class="detail-label">Watering:</span> {{ plant.watering_schedule }}</p>
                <p class="plant-info"><span class="detail-emoji">📅</span> <span class="detail-label">Last watered:</span> {{ formatDate(plant.last_watered) }}</p>
                <p class="plant-info"><span class="detail-emoji">❤️</span> <span class="detail-label">Health:</span> {{ plant.health_status }}</p>
                <p class="plant-info"><span class="detail-emoji">📝</span> <span class="detail-label">Notes:</span> {{ plant.notes || 'No notes added yet.' }}</p>
              </div>
              
            </div>
            
            <div class="card-footer">
              <div class="button-group">
                <button @click.stop="editPlant(index)" class="btn-edit">Edit</button>
                <button @click.stop="deletePlant(index)" class="btn-delete">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      },
      previewImage: null,
      editingIndex: null
    }
  },
  mounted() {
    // Load existing plants from database
    this.loadPlants();
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
      this.expandedCardIndex = index;
    },
    closeCardDetails() {
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
      } catch (error) {
        console.error("❌ Failed to load plants from Firestore:", error);
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
        alert('Please enter a plant name.');
        return;
      }

      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('You must be logged in to save a plant.');
        return;
      }

      try {
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

        const res = await fetch("/api/plants/add-plant", {
          method: "POST",
          body: formData
        });

        const result = await res.json();

        if (result.success) {
          alert("🌱 Plant added!");
          this.resetForm();
          this.showUploadForm = false;
          this.loadPlants(); // Reload to reflect the new addition
        } else {
          throw new Error(result.error || "Unknown error");
        }
      } catch (error) {
        console.error("❌ Failed to save plant:", error);
        alert("Failed to save plant.");
      }
    },


    async deletePlant(index) {
      if (!confirm('Are you sure you want to delete this plant?')) return;

      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          alert("You must be logged in to delete a plant.");
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
          alert("Plant deleted successfully.");
        } else {
          alert("Failed to delete plant. Try again.");
        }
      } catch (error) {
        console.error("❌ Failed to delete plant:", error);
        alert("An error occurred while deleting the plant.");
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

.top-navigation {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: white;
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

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.card-img-top {
  width: 100%;
  height: 180px; /* Fixed height for images */
  object-fit: cover;
}

.close-btn {
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
}

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

.plant-details-container {
  max-height: 180px;
  overflow-y: auto;
  margin-bottom: 0.5rem;
  padding-right: 5px;
  
  /* Custom scrollbar styling */
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

.card-footer {
  padding: 0.2rem 1rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}

.button-group {
  display: flex;
  justify-content: space-between;
  min-width: 100%; /* Ensure full width */
  gap: 8px; /* Add minimum gap between buttons */
}

.btn-edit, .btn-delete {
  padding: 6px 12px;
  font-size: 0.9rem;
  flex: 1; /* Allow buttons to grow/shrink proportionally */
  min-width: 60px; /* Ensure minimum width */
  max-width: calc(50% - 4px); /* Prevent buttons from exceeding half the width minus gap */
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-radius: 5px;
  font-weight: bold;
}

.btn-edit {
  background-color: #072d13;
  color: white;
  border-color:white;
  border: solid;
  
}

.btn-edit:hover {
  background-color: #0a3b1a;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
  border-color: white;
  border: solid;
}

.btn-delete:hover {
  background-color: #c82333;
}

/* Empty State */
.empty-state {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  margin-top: 30px;
  color: white;
}

.water-bar-container {
  width: 100%;
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.water-bar {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
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
  
  .top-navigation {
    position: relative;
    top: 0;
    right: 0;
    width: fit-content;
    margin-left: auto;
    margin-bottom: 20px;
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