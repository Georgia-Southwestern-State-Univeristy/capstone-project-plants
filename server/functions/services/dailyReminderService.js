const { db } = require('../../server/firebaseAdmin'); // adjust path if needed
const { sendWateringReminder } = require('./notificationService');

/**
 * Runs once a day and sends watering reminders to users based on lastWatered and wateringSchedule.
 */
async function sendDailyWateringReminders() {
  const usersSnapshot = await db.collection('users').get();

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;
    const userEmail = userDoc.data().email;

    if (!userEmail) {
      console.warn(`⚠️ No email found for user: ${userId}`);
      continue;
    }

    const plantSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('userPlants')
      .get();

      const reminders = [];

      plantSnapshot.forEach((doc) => {
        const plant = doc.data();
        if (!plant.lastWatered || !plant.wateringSchedule) return;
      
        const last = new Date(plant.lastWatered);
        const now = new Date();
        const daysSince = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      
        if (daysSince >= plant.wateringSchedule) {
          reminders.push({
            name: plant.plantName || 'Unnamed Plant',
            imageUrl: plant.imageUrl || 'https://via.placeholder.com/120?text=No+Image'
          });
        }
      });
      
    if (reminders.length > 0) {
      await sendWateringReminder(userEmail, reminders);
    }
  }
}

module.exports = { sendDailyWateringReminders };
