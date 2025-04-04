// tests/auth.test.js
import request from 'supertest';
import app from '../vueServer.js'; // Make sure vueServer.js exports the app

describe('Auth Routes', () => {
  it('should return 400 for missing fields during registration', async () => {
    const response = await request(app)
      .post('/api/auth/register') // matches how you mounted routes
      .send({ email: 'test@example.com' }); // missing password & name

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});
