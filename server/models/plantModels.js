// models/Plant.js
// KENDRICK CHANGE - added sunlight attribute 
export default class Plant {
    constructor(name, type, sunlightSchedule, wateringSchedule, lastWatered, healthStatus = "Healthy", notes = "", images = []) {
      this.name = name;
      this.type = type;
      this.sunlightSchedule = sunlightSchedule
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
        sunlightSchedule: this.sunlightSchedule,
        wateringSchedule: this.wateringSchedule,
        lastWatered: this.lastWatered,
        healthStatus: this.healthStatus,
        notes: this.notes,
        images: this.images,
      };
    }
  }
  