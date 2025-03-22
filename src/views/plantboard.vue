<template>
    <div class="col-12 mt-4">
      <div class="card" style="border-width: 2px; border-color: #341c02;">
        <div class="card-body">
          <!-- Plants Heading -->
          <h3 style="color: #072d13; font-weight: bold; margin-bottom: 20px;">Your Plants</h3>
  
          <!-- Add Plant Button -->
          <div class="mb-3">
            <router-link to="/add" class="btn add-plant-btn" id="addButtonProfile">
              Add a New Plant
            </router-link>
          </div>
  
          <!-- Loading Indicator -->
          <div v-if="loading" class="text-center text-muted py-4">
            <p>Loading your plants...</p>
          </div>
  
          <!-- Plants List -->
          <div v-else-if="userPlants.length" class="plants-container">
            <div v-for="plant in userPlants" :key="plant.id" class="plant-card">
              <!-- Plant Image -->
              <img 
                v-if="plant.imageUrl" 
                :src="plant.imageUrl" 
                class="plant-image img-fluid rounded" 
                alt="Plant Image"
              />
              
              <!-- Plant Info -->
              <div class="plant-info">
                <h4 class="plant-name">{{ plant.plantName }}</h4>
                <p><strong>Watering:</strong> {{ plant.wateringSchedule }}</p>
              </div>
            </div>
          </div>
  
          <!-- No Plants Message -->
          <div v-else class="text-center text-muted py-4">
            <p>No plants added yet. Add your first plant to get started!</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { getAuth } from 'firebase/auth';
  import { getFirestore, collection, getDocs } from 'firebase/firestore';
  
  export default {
    name: 'plantboard',
    
    setup() {
      const userPlants = ref([]);
      const loading = ref(true);
  
      const fetchUserPlants = async () => {
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
  
          userPlants.value = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          console.log("✅ Fetched user plants:", userPlants.value);
        } catch (error) {
          console.error("❌ Failed to fetch user plants:", error);
        } finally {
          loading.value = false;
        }
      };
  
      onMounted(async () => {
        await fetchUserPlants();
      });
  
      return {
        userPlants,
        loading,
        fetchUserPlants
      };
    }
  }
  </script>
  
  <style scoped>
  /* Plants container styling */
  .plants-container {
    min-height: 100px;
    width: 100%;
  }
  
  /* Plant Card Styling */
  .plants-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
  }
  
  .plant-card {
    width: 220px;
    border: 2px solid #341c02;
    border-radius: 15px;
    padding: 15px;
    text-align: center;
    background: #fff;
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 0.1);
  }
  
  .plant-image-container {
    width: 100%;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f4f4f4;
    border-radius: 10px;
    margin-bottom: 10px;
  }
  
  .plant-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 10px;
  }
  
  .placeholder-image {
    font-size: 14px;
    color: #777;
  }
  
  .plant-info {
    text-align: left;
  }
  
  .plant-name {
    font-size: 1.2rem;
    font-weight: bold;
    color: #072d13;
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
  
  /* Add Plant Button styling */
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
  
  #addButtonProfile {
    text-decoration: none;
    color: white;
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
  </style>