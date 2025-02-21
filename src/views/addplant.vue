<template>
    <div class="add-plant-page">
      <div class="container py-5">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <!-- Bootstrap Card -->
            <div class="card text-center">
              <!-- Card Header -->
              <div class="card-header">
                Add a New Plant
              </div>
              
              <!-- Card Body with Form -->
              <div class="card-body">
                <h5 class="card-title">Plant Information</h5>
                
                <form>
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
                  <button type="button" class="btn" id="add-plant-btn" @click="handleSubmit">
                    Add Plant
                  </button>
                </form>
              </div>
              
              <!-- Card Footer -->
              <div class="card-footer text-muted">
                Your plant will be added to your profile
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
    background-color: #072d13; /* Dark green background matching other pages */
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
  
  .card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .card-header {
    background-color: #072d13;
    color: white;
    font-weight: bold;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    padding: 15px 0;
    border-radius: 8px 8px 0 0;
  }
  
  .card-title {
    color: #072d13;
    font-weight: bold;
    margin-bottom: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .form-label {
    color: #072d13;
    font-weight: bold;
    text-align: left;
    display: block;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .card-footer {
    background-color: #f8f9fa;
    border-top: 1px solid rgba(0, 0, 0, 0.125);
    padding: 10px 0;
    color: #6c757d;
  }
  
  #add-plant-btn {
    background-color: #072d13;
    color: white;
    border-radius: 20px;
    padding: 8px 25px;
    font-weight: bold;
    border: none;
    transition: all 0.3s ease;
    margin-top: 10px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  #add-plant-btn:hover {
    background-color: #0a3b1e;
    transform: translateY(-2px);
  }
  
  .form-control, .form-select {
    border: 1px solid #ced4da;
    border-radius: 6px;
    padding: 8px 12px;
    margin-bottom: 5px;
  }
  
  .form-control:focus, .form-select:focus {
    border-color: #072d13;
    box-shadow: 0 0 0 0.25rem rgba(7, 45, 19, 0.25);
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .card-body {
      padding: 1.25rem;
    }
  }
  
  @media (max-width: 576px) {
    .form-label {
      font-size: 14px;
    }
    
    .card-header, .card-footer {
      padding: 10px 0;
    }
  }
  </style>
  