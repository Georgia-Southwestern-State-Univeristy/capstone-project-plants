<template>
    <div class="add-plant-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="card shadow">
              <div class="card-header text-center py-3">
                <h4 class="card-title mb-0">Add a New Plant</h4>
              </div>
              <div class="card-body">
                <form @submit.prevent="handleSubmit">
                  <!-- Plant Name -->
                  <div class="mb-3">
                    <label for="plantName" class="form-label">Plant Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="plantName" 
                      v-model="plant.name"
                      placeholder="Enter plant name" 
                      required
                    >
                  </div>
  
                  <!-- Plant Type -->
                  <div class="mb-3">
                    <label for="plantType" class="form-label">Plant Type</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="plantType" 
                      v-model="plant.type"
                      placeholder="E.g., Succulent, Herb, Flowering" 
                      required
                    >
                  </div>
  
                  <!-- Watering Schedule -->
                  <div class="mb-3">
                    <label for="wateringSchedule" class="form-label">Watering Schedule</label>
                    <div class="input-group">
                      <input 
                        type="number" 
                        class="form-control" 
                        id="wateringSchedule" 
                        v-model="wateringFrequency"
                        placeholder="E.g., 7" 
                        min="1"
                        required
                      >
                      <span class="input-group-text">days</span>
                    </div>
                  </div>
  
                  <!-- Last Watered -->
                  <div class="mb-3">
                    <label for="lastWatered" class="form-label">Last Watered</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      id="lastWatered" 
                      v-model="plant.lastWatered"
                      required
                    >
                  </div>
  
                  <!-- Health Status -->
                  <div class="mb-3">
                    <label for="healthStatus" class="form-label">Health Status</label>
                    <select 
                      class="form-select" 
                      id="healthStatus" 
                      v-model="plant.healthStatus"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Needs Attention">Needs Attention</option>
                      <option value="Unhealthy">Unhealthy</option>
                    </select>
                  </div>
  
                  <!-- Notes -->
                  <div class="mb-3">
                    <label for="notes" class="form-label">Notes</label>
                    <textarea 
                      class="form-control" 
                      id="notes" 
                      v-model="plant.notes"
                      rows="3" 
                      placeholder="Any special care instructions or observations..."
                    ></textarea>
                  </div>
  
                  <!-- Submit Button -->
                  <div class="d-grid">
                    <button type="submit" class="add-plant-btn">
                      <i class="bi bi-plus-circle me-2"></i>
                      Add Plant
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'AddPlantPage',
    data() {
      return {
        plant: {
          name: '',
          type: '',
          wateringSchedule: { frequency: '7 days' },
          lastWatered: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
          healthStatus: 'Healthy',
          notes: '',
          images: []
        },
        wateringFrequency: 7
      }
    },
    watch: {
      wateringFrequency(newValue) {
        this.plant.wateringSchedule = { frequency: `${newValue} days` };
      }
    },
    methods: {
      handleSubmit() {
        // This would usually dispatch to your store or call an API
        console.log('Plant data submitted:', this.plant);
        
        // For now, just show an alert
        alert('Plant added successfully!');
        
        // Reset the form
        this.resetForm();
      },
      resetForm() {
        this.plant = {
          name: '',
          type: '',
          wateringSchedule: { frequency: '7 days' },
          lastWatered: new Date().toISOString().split('T')[0],
          healthStatus: 'Healthy',
          notes: '',
          images: []
        };
        this.wateringFrequency = 7;
      }
    }
  }
  </script>
  
  <style scoped>
  .add-plant-page {
    background-color: #072d13; /* Dark green background */
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  
  .card {
    border-radius: 15px;
    border: none;
    background-color: white;
  }
  
  .card-header {
    background-color: #F5E6D3; /* Cream color header */
    border-bottom: 2px solid #072d13;
    border-radius: 15px 15px 0 0 !important;
  }
  
  .card-title {
    color: #072d13;
    font-weight: bold;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .form-label {
    color: #072d13;
    font-weight: bold;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .add-plant-btn {
    background-color: #072d13;
    color: white;
    border-radius: 25px;
    padding: 10px 20px;
    font-weight: bold;
    border: none;
    transition: all 0.3s ease;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .add-plant-btn:hover {
    background-color: #0a3b1e;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  .form-control, .form-select {
    border: 1px solid #ced4da;
    border-radius: 8px;
    padding: 10px 15px;
    transition: all 0.3s ease;
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #072d13;
    box-shadow: 0 0 0 0.25rem rgba(7, 45, 19, 0.25);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .card-body {
      padding: 1.5rem;
    }
  }
  
  @media (max-width: 576px) {
    .add-plant-page {
      padding: 1rem;
    }
    
    .card-body {
      padding: 1rem;
    }
  }
  </style>