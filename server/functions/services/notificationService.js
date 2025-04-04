const sgMail = require('@sendgrid/mail');
const functions = require('firebase-functions');

sgMail.setApiKey(functions.config().sendgrid.key);

/**
 * Send a watering reminder email
 * @param {string} to - user email
 * @param {Array<string>} plants - list of plant names needing watering
 */


async function sendWateringReminder(to, plants) {
  const msg = {
    to,
    from: 'yourbot@verdue.ai',
    subject: '🌱 Don’t Forget to Water Your Plants!',
    text: `The following plants need watering:\n${plants.join('\n')}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px; margin: auto; background: #f9f9f9; border-radius: 12px; border: 1px solid #e0e0e0;">
        <div style="text-align: center;">
          <img src="https://i.imgur.com/xWDIK3K.png" alt="Verdue Logo" style="width: 80px; margin-bottom: 12px;" />
          <h2 style="color: #072d13;">🌿 Watering Reminder</h2>
        </div>
  
        <p style="font-size: 16px; color: #333;">Hello plant parent,</p>
        <p style="font-size: 15px; color: #333;">
          The following plants in your Verdue collection need watering today:
        </p>
  
        <ul style="font-size: 15px; color: #072d13; margin-left: 20px;">
          ${plants.map(p => `<li>${p}</li>`).join('')}
        </ul>
  
        <p style="font-size: 15px; color: #333;">
          Make sure to give them the love they need. 💧🌞
        </p>
  
        <div style="margin-top: 30px; font-size: 13px; color: #999; border-top: 1px solid #ddd; padding-top: 10px;">
          You’re receiving this reminder because you signed up for plant care updates on <strong>Verdue</strong>.
          <br/>
          <a href="https://your-app.vercel.app/settings" style="color: #999;">Manage your notifications</a>
        </div>
      </div>
    `
  };
  

  try {
    await sgMail.send(msg);
    console.log(`✅ Sent watering reminder to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error);
  }
}

module.exports = {
  sendWateringReminder
};
