const { sendDailyWateringReminders } = require('./services/sendDailyWateringReminders');

exports.dailyWateringReminder = functions.pubsub
  .schedule('every day 08:00')
  .timeZone('America/New_York') // adjust to your users’ region
  .onRun(async () => {
    console.log('🌞 Running daily watering reminder...');
    await sendDailyWateringReminders();
  });
