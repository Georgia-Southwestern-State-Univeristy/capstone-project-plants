// models/Plant.js
export default class Plant {
    constructor(name, type, wateringSchedule, lastWatered, healthStatus = "Healthy", notes = "", images = []) {
      this.name = name;
      this.type = type;
      this.wateringSchedule = wateringSchedule; // { frequency: '7 days' }
      this.lastWatered = lastWatered; // Date format
      this.healthStatus = healthStatus;
      this.notes = notes;
      this.images = images;
    }
  
    toFirestore() {
      return {
        name: this.name,
        type: this.type,
        wateringSchedule: this.wateringSchedule,
        lastWatered: this.lastWatered,
        healthStatus: this.healthStatus,
        notes: this.notes,
        images: this.images,
      };
    }
  }
  