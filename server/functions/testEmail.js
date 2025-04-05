import { sendWateringReminder } from './services/notificationService.js';

const testPlants = [
  {
    name: 'Garden Roses',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/verdueai.firebasestorage.app/o/users%2FGwjlDDL0tmZwH8NyE61Jl7V3xcg2%2Fuploads%2F1743792057051_plant.jpg?alt=media'

  },
  {
    name: 'Zinnia',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/verdueai.firebasestorage.app/o/users%2FGwjlDDL0tmZwH8NyE61Jl7V3xcg2%2Fuploads%2F1743792082396_plant.jpg?alt=media'
  }
];

sendWateringReminder('sahildepatel@gmail.com', testPlants)
  .then(() => console.log('✅ Test email sent!'))
  .catch(err => console.error('❌ Error sending test email:', err));
