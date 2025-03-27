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
              <div class="plant-details-container">
                <p class="plant-info"><span class="detail-emoji">🌿</span> <span class="detail-label">Type:</span> {{ plant.type }}</p>
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
    // Load existing plants from database
    this.loadPlants();
  },
  methods: {
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
            watering_schedule: data.wateringSchedule || "Unknown",
            sunlight: data.sunlight || "Unknown",
            last_watered: data.lastWatered || null,  // if you start tracking this
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
      } else if (!plantToSave.image_url) {
        // Set a default image if none provided
        plantToSave.image_url = "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80";
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
      
      // Save to local storage for persistence
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

/* MDBootstrap Style Cards with fixed dimensions */
.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -15px;
  margin-left: -15px;
}

.col {
  flex: 0 0 100%;
  max-width: 100%;
  padding: 0 15px;
  margin-bottom: 30px;
}

.row-cols-md-2 > .col {
  flex: 0 0 50%;
  max-width: 50%;
}

.row-cols-lg-3 > .col {
  flex: 0 0 33.333333%;
  max-width: 33.333333%;
}

.g-4 {
  gap: 1.5rem;
}

/* Fixed card dimensions */
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 600px; /* Fixed height for all cards */
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
}

.plant-card-front {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
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
  padding: 20px;
  text-align: center;
}

.overlay-title {
  color: white;
  font-size: 1.75rem;
  margin-bottom: 10px;
  font-weight: bold;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
}

.overlay-subtitle {
  color: white;
  font-size: 1rem;
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
  height: 200px; /* Fixed height for images */
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
  padding: 1.25rem;
  overflow: hidden;
}

.card-title {
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #072d13;
}

.plant-details-container {
  height: 800px; /* Fixed height for details */
  overflow-y: auto;
  margin-bottom: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: #072d13 #f0f0f0;
}

.plant-details-container::-webkit-scrollbar {
  width: 5px;
}

.plant-details-container::-webkit-scrollbar-track {
  background: #f0f0f0;
  border-radius: 5px;
}

.plant-details-container::-webkit-scrollbar-thumb {
  background-color: #072d13;
  border-radius: 5px;
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
  padding: 0.75rem 1.25rem;
  background-color: rgba(0, 0, 0, 0.03);
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}

.button-group {
  display: flex;
  justify-content: space-between;
}

.btn-edit, .btn-delete {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;
}

.btn-edit {
  background-color: #072d13;
  color: white;
}

.btn-edit:hover {
  background-color: #0a3b1a;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
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

/* Responsive styles */
@media (max-width: 991.98px) {
  .row-cols-lg-3 > .col {
    flex: 0 0 50%;
    max-width: 50%;
  }
}

@media (max-width: 767.98px) {
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

@media (max-width: 480px) {
  .plantboard-container {
    padding: 15px;
  }
  
  .col {
    padding: 0 10px;
  }
}
</style>