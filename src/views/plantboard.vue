<!-- plantboard.vue -->
<template>
  <div class="plantboard-container">
    <div class="top-navigation">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item"><a href="/chat" class="breadcrumb-link">Chat</a></li>
          <li class="breadcrumb-item"><a href="/userprofile" class="breadcrumb-link">Account</a></li>
          <li class="breadcrumb-item"><a href="/login" class="breadcrumb-link">Sign Out</a></li>
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
          <label for="wateringSchedule">Watering Schedule</label>
          <input type="text" id="wateringSchedule" v-model="newPlant.watering_schedule" class="form-control" placeholder="How often to water">
        </div>
        
        <div class="form-group">
          <label for="lastWatered">Last Watered</label>
          <input type="date" id="lastWatered" v-model="newPlant.last_watered" class="form-control">
        </div>
        
        <div class="form-group">
          <label for="healthStatus">Health Status</label>
          <select id="healthStatus" v-model="newPlant.health_status" class="form-control">
            <option value="Healthy">Healthy</option>
            <option value="Needs Attention">Needs Attention</option>
            <option value="Critical">Critical</option>
          </select>
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
    <div v-if="plants.length > 0" class="plants-grid">
      <div 
        v-for="(plant, index) in plants" 
        :key="index" 
        class="plant-card-container"
        @click="toggleCardDetails(index)"
        :class="{ 'expanded': expandedCardIndex === index }"
      >
        <!-- Card Front (Image with overlay) -->
        <div class="card-front" v-show="expandedCardIndex !== index">
          <div class="plant-image-overlay">
            <img :src="plant.image_url || '/default-plant.jpg'" alt="Plant Image">
            <div class="overlay-content">
              <h3 class="overlay-title">{{ plant.name }}</h3>
              <p class="overlay-subtitle">Click for more</p>
            </div>
          </div>
        </div>

        <!-- Card Back (Details) -->
        <div class="card-back" v-show="expandedCardIndex === index">
          <div class="card-back-content">
            <div class="card-header">
              <h3 class="plant-name">{{ plant.name }}</h3>
              <button class="close-card-btn" @click.stop="closeCardDetails(index)">×</button>
            </div>
            
            <div class="card-details-body">
              <div class="thumbnail-container">
                <img :src="plant.image_url || '/default-plant.jpg'" alt="Plant thumbnail" class="plant-thumbnail">
              </div>
              
              <div class="plant-info-container">
                <p class="plant-info"><span class="detail-emoji">🌿</span> <span class="detail-label">Type:</span> {{ plant.type }}</p>
                <p class="plant-info"><span class="detail-emoji">💧</span> <span class="detail-label">Watering:</span> {{ plant.watering_schedule }}</p>
                <p class="plant-info"><span class="detail-emoji">☀️</span> <span class="detail-label">Sunlight:</span> {{ plant.sunlight }}</p>
                <p class="plant-info"><span class="detail-emoji">📅</span> <span class="detail-label">Last watered:</span> {{ formatDate(plant.last_watered) }}</p>
                <p class="plant-info"><span class="detail-emoji">❤️</span> <span class="detail-label">Health:</span> {{ plant.health_status }}</p>
                <p class="plant-info"><span class="detail-emoji">📝</span> <span class="detail-label">Notes:</span> {{ plant.notes }}</p>
              </div>
              
              <div class="card-actions">
                <button @click.stop="editPlant(index)" class="btn-edit">Edit</button>
                <button @click.stop="deletePlant(index)" class="btn-delete">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State Message -->
    <div v-else class="empty-state">
      <p>You haven't added any plants yet. Click the "Add a new plant" button to get started!</p>
    </div>
  </div>
</template>

<script>
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/utils/firebase'; // update based on your setup

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
    // Load existing plants from local storage or API
    this.loadPlants();
    
    // Add click event listener to close expanded cards when clicking outside
    document.addEventListener('click', this.handleDocumentClick);
  },
  beforeUnmount() {
    // Clean up event listener
    document.removeEventListener('click', this.handleDocumentClick);
  },
  methods: {
    handleDocumentClick(event) {
      // Check if click is outside any card
      if (this.expandedCardIndex !== null) {
        const expandedCard = document.querySelector('.plant-card-container.expanded');
        if (expandedCard && !expandedCard.contains(event.target)) {
          this.expandedCardIndex = null;
        }
      }
    },
    toggleCardDetails(index) {
      if (this.expandedCardIndex === index) {
        this.expandedCardIndex = null;
      } else {
        this.expandedCardIndex = index;
      }
    },
    closeCardDetails(index) {
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
            name: data.plantName || "Unknown",
            type: data.scientificName || "Unknown",
            watering_schedule: data.wateringSchedule || "Unknown",
            sunlight: data.sunlight || "Unknown",
            last_watered: data.lastWatered || null,  // if you start tracking this
            health_status: "Healthy",  // default for now
            notes: "",
            image_url: data.imageUrl || "/default-plant.jpg",
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
        alert('Please enter a plant name');
        return;
      }
      
      // Create a copy of the plant object
      const plantToSave = { ...this.newPlant };
      
      // Handle image upload
      if (this.newPlant.image) {
        try {
          // If using a backend, upload the image and get URL
          // const imageUrl = await this.uploadImageToServer(this.newPlant.image);
          // plantToSave.image_url = imageUrl;
          
          // For demo purposes, we'll just use a dataURL
          plantToSave.image_url = this.previewImage;
        } catch (error) {
          console.error('Failed to upload image:', error);
          alert('Failed to upload image. Please try again.');
          return;
        }
      }
      
      // Remove the file object before saving
      delete plantToSave.image;
      
      if (this.editingIndex !== null) {
        // Update existing plant
        this.plants[this.editingIndex] = plantToSave;
      } else {
        // Add new plant
        this.plants.push(plantToSave);
      }
      
      // Save to local storage
      localStorage.setItem('plants', JSON.stringify(this.plants));
      
      // Reset form and hide it
      this.resetForm();
      this.showUploadForm = false;
    },
    deletePlant(index) {
      if (confirm('Are you sure you want to delete this plant?')) {
        this.plants.splice(index, 1);
        localStorage.setItem('plants', JSON.stringify(this.plants));
        // Reset expanded index if deleted card was expanded
        if (this.expandedCardIndex === index) {
          this.expandedCardIndex = null;
        } else if (this.expandedCardIndex > index) {
          // Adjust index if needed
          this.expandedCardIndex--;
        }
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
.plantboard-container {
  background-color: #072d13;
  min-height: 100vh;
  padding: 30px;
  position: relative;
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
  gap: 10px;
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
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
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
}

.btn-save {
  background-color: #072d13;
  color: white;
}

.btn-cancel {
  background-color: #f0f0f0;
  color: #333;
}

/* Plants Grid Layout */
.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* Plant Card Container */
.plant-card-container {
  height: 300px;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  perspective: 1000px; /* Add perspective for 3D effect */
}

.plant-card-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.plant-card-container.expanded {
  cursor: default;
  z-index: 10;
  transform: translateY(0); /* Reset transform when expanded */
}

/* Card Front (Image with Overlay) */
.card-front {
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1; /* Ensure front is above the back initially */
  transition: opacity 0.3s ease-in-out;
}

.expanded .card-front {
  opacity: 0; /* Fade out the front when card is expanded */
}

.plant-image-overlay {
  position: relative;
  height: 100%;
  width: 100%;
}

.plant-image-overlay img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.6);
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
  padding: 20px;
  text-align: center;
}

.overlay-title {
  color: white;
  font-size: 24px;
  margin-bottom: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.overlay-subtitle {
  color: white;
  font-size: 16px;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

/* Card Back (Details) */
.card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.4s ease-in-out;
  transform: translateY(100%); /* Start from below */
}

.expanded .card-back {
  transform: translateY(0); /* Slide up to fully visible */
}

.card-back-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  background-color: #072d13;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plant-name {
  margin: 0;
  font-size: 18px;
}

.close-card-btn {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.card-details-body {
  padding: 15px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.thumbnail-container {
  text-align: center;
  margin-bottom: 10px;
}

.plant-thumbnail {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #072d13;
}

.plant-info-container {
  flex: 1;
  overflow-y: auto;
}

.plant-info {
  margin-bottom: 8px;
  font-size: 14px;
}

.detail-emoji {
  margin-right: 5px;
}

.detail-label {
  font-weight: bold;
  color: #072d13;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 10px;
}

.btn-edit, .btn-delete {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.btn-edit {
  background-color: #072d13;
  color: white;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
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

/* Responsive Styles */
@media (max-width: 768px) {
  .plants-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .plant-card-container {
    height: 250px;
  }
  
  .plant-thumbnail {
    width: 80px;
    height: 80px;
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
}

@media (max-width: 480px) {
  .plants-grid {
    grid-template-columns: 1fr;
  }
  
  .plantboard-container {
    padding: 15px;
  }
}
</style>