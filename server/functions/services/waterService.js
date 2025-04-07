export function calculateWaterLevel(plant) {
    const lastWatered = new Date(plant.lastWatered);
    const today = new Date();
    const schedule = plant.wateringSchedule || 3;
  
    const daysSince = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
  
    const percent = Math.max(0, 100 - (daysSince / schedule) * 100);
    return Math.round(Math.min(percent, 100)); // clamp between 0 and 100
  }
  