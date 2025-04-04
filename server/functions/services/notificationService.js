import sgMail from '@sendgrid/mail';
import { config } from 'firebase-functions';


sgMail.setApiKey(config().sendgrid.key);

/**
 * Send a watering reminder email
 * @param {string} to - user email
 * @param {Array<string>} plants - list of plant names needing watering
 */


export async function sendWateringReminder(to, plants) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px;">
      <h2>🌿 Watering Reminder</h2>
      <p>The following plants need watering today:</p>
      ${plants.map(p => `
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <img src="${p.imageUrl}" alt="${p.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; margin-right: 10px;" />
          <strong style="font-size: 16px;">${p.name}</strong>
        </div>
      `).join('')}
      <p>Keep up the great work caring for your plants! 💧🌱</p>
    </div>
  `;

  const msg = {
    to,
    from: 'yourbot@verdue.ai',
    subject: '🪴 Your Plants Need Watering Today!',
    text: `Your plants need water!`,
    html
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Sent watering reminder to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
}
