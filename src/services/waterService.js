export function calculateWaterLevel(plant) {
    const lastWatered = new Date(plant.last_watered);
    const today = new Date();
    const schedule = Number(plant.watering_schedule) || 3;
  
    const daysSince = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
    const percent = Math.max(0, 100 - (daysSince / schedule) * 100);
    return Math.round(Math.min(percent, 100));
  }
  