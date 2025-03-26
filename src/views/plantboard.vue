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
      <div v-if="showUploadForm" class="upload-form-container" id="">
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
  
      <!-- Plants Gallery -->
      <div v-if="plants.length > 0" class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col" v-for="(plant, index) in plants" :key="index">
          <div class="card plant-card .h-200">
            <img :src="plant.image_url || '/default-plant.jpg'" class="card-img-top" :alt="plant.name" id="cardImage">
            <div class="card-body">
              <div class="plant-header">
              <h5 class="card-title plant-name">{{ plant.name }}</h5>
              </div>
              
              <div class="plant-details">
  <p class="plant-info"><span class="detail-emoji">🌿</span> <span class="detail-label">Type:</span> {{ plant.type }}</p>
  <p class="plant-info"><span class="detail-emoji">💧</span> <span class="detail-label">Watering:</span> {{ plant.watering_schedule }}</p>
  <p class="plant-info"><span class="detail-emoji">☀️</span> <span class="detail-label">Sunlight:</span> {{ plant.sunlight }}</p>
  <p class="plant-info"><span class="detail-emoji">📅</span> <span class="detail-label">Last watered:</span> {{ formatDate(plant.last_watered) }}</p>
  <p class="plant-info"><span class="detail-emoji">❤️</span> <span class="detail-label">Health:</span> {{ plant.health_status }}</p>
  <p class="plant-info"><span class="detail-emoji">📝</span> <span class="detail-label">Notes:</span> {{ plant.notes }}</p>
</div>
              <div class="card-actions">
                <button @click="editPlant(index)" class="btn-edit">Edit</button>
                <button @click="deletePlant(index)" class="btn-delete">Delete</button>
                
              </div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Empty State Message -->
      <div v-else class="empty-state" >
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
    },
    methods: {
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
            //const imageUrl = await this.uploadImageToServer(this.newPlant.image);
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
      },
      // For backend implementation
      async fetchPlantsFromAPI() {
        // Example API call
        // try {
        //   const response = await fetch('/api/plants');
        //   this.plants = await response.json();
        // } catch (error) {
        //   console.error('Failed to fetch plants:', error);
        // }
      },
      async uploadImageToServer(file) {
        // Example implementation for backend
        // const formData = new FormData();
        // formData.append('image', file);
        
        // const response = await fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData
        // });
        
        // const data = await response.json();
        // return data.imageUrl;
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
    margin-bottom: 10px;
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
  
  .plant-card {
    transition: transform 0.3s;
    margin-bottom: 20px;
    background-color: white;
    border: 10px solid white;
    border-radius: 15px;
    padding: 5px  5px 2px 5px;
    display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  }

  .plant-header {
  margin-bottom: 0;
  position: relative;
  z-index: 2;
  padding-bottom: 17px; /* Space for the fade */
}

.plant-name {
  font-size: 1.2rem;
  font-weight: bold;
  color: #072d13;
  margin-bottom: 5px;
}


.plant-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 25px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.9) 40%,
    rgba(255, 255, 255, 0.7) 70%,
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
}

  img#cardImage {
    border-radius: 15px;
  }
  

.card-body {
  padding: 2px;
}

  .plant-card:hover {
    transform: translateY(-5px);
  }
  
  .card-img-top {
    height: 200px;
    object-fit: cover;
  }
  
  .plant-details {
    margin-top: 15px;
    flex: 1;
  overflow-y: auto;
  max-height: 180px;
  scrollbar-width: thin;
  scrollbar-color: #072d13 #f0f0f0;
  position: relative;
  margin-top: -10px; /* Pull up slightly to overlap with the fade */
  padding-top: 15px; 
  


  }
  
  .plant-info {
  margin-bottom: 8px;
  text-align: left;
  }




  .plant-image-container {
  position: relative;
  width: 100%;
  height: 150px;
  border-radius: 10px 10px 0 0;
  margin-bottom: 0px;
  overflow: hidden;

}



.plant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  
}

.plant-image-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, white);
  pointer-events: none;
}
  
  .detail-label {
    color: #072d13;
    font-weight: bold;
  }

  .card-title {
    color: #072d13;
    font-weight: bold;
  }
  
  .card-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }
  
  .btn-delete, .btn-edit {
    padding: 5px 10px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .btn-delete {
    background-color: #dc3545;
    color: white;
    font-weight: bold;
  }
  
  .btn-edit {
    background-color: #072d13;
    color: white;
    font-weight: bold;
  }
  
  .plants-gallery-container {
    margin-top: 10px;
  }
  
  .empty-state {
    background-color: #072d13;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    margin-top: 10px;
    color: white;
  }
  
  @media (max-width: 768px) {
    .top-navigation {
      position: relative;
      top: 0;
      right: 0;
      width: fit-content;
      margin-left: auto;
      margin-bottom: 20px;
    }
    
    .breadcrumb {
      flex-wrap: wrap;
    }
    
    .header-section {
      margin-top: 10px;
    }
    
    .your-plants-title {
      font-size: 1.7rem;
    }
    
    .button-container {
      margin-bottom: 20px;
    }
  }
  </style>