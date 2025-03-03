import request from 'supertest';
import app from '../server/vueServer.js'; // Adjusted for root-level test folder
import { db, auth } from '../server/utils/firebaseAdmin.js';

import { jest } from '@jest/globals';

await jest.unstable_mockModule('ioredis', () => {
    return {
      default: jest.fn(() => ({
        set: jest.fn(),
        get: jest.fn(),
        // Add additional methods if needed
      }))
    };
  });

import Redis from 'ioredis';
const mockRedis = new Redis();
import { fetchPlantFromPerenual } from '../server/services/perenualService.js';
import { analyzeImage } from '../server/services/visionService.js';
import { generateGeminiResponse } from '../server/services/geminiService.js';



// Set up mocks before importing the app or modules that use them
await jest.unstable_mockModule('../server/utils/firebaseAdmin.js', () => ({
    db: {
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
                delete: jest.fn(),
                collection: jest.fn(() => ({ get: jest.fn(), add: jest.fn() }))
            }))
        }))
    },
    auth: {
        verifyIdToken: jest.fn()
    }
}));



await jest.unstable_mockModule('../server/services/perenualService.js', () => ({
    fetchPlantFromPerenual: jest.fn()
}));

await jest.unstable_mockModule('../server/services/visionService.js', () => ({
    analyzeImage: jest.fn()
}));

await jest.unstable_mockModule('../server/services/geminiService.js', () => ({
    generateGeminiResponse: jest.fn()
}));


describe('🔹 Authentication Routes', () => {
    test('✅ Should register a user', async () => {
        const res = await request(app)
            .post('api/auth/register')
            .send({ email: 'test@example.com', password: '123456', name: 'Test User' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
    });

    test('❌ Should return 400 for missing fields in register', async () => {
        const res = await request(app).post('/api/auth/register').send({});
        expect(res.status).toBe(400);
    });
});

describe('🔹 Cache Routes', () => {
    test('✅ Should set cache value', async () => {
        mockRedis.set.mockResolvedValue('OK');
        const res = await request(app)
            .post('/api/cache')
            .send({ key: 'testKey', value: 'testValue', duration: 3600 });
        expect(res.status).toBe(200);
    });

    test('✅ Should get cached value', async () => {
        mockRedis.get.mockResolvedValue(JSON.stringify('testValue'));
        const res = await request(app).get('/api/cache/testKey');
        expect(res.status).toBe(200);
    });
});

describe('🔹 Chat Routes', () => {
    test('❌ Should return 401 for unauthorized chat request', async () => {
        const res = await request(app).post('/api/chat/chat').send({ message: 'Hello AI' });
        expect(res.status).toBe(401);
    });
});

describe('🔹 Plant Routes', () => {
    beforeEach(() => {
        fetchPlantFromPerenual.mockResolvedValue({
            common_name: 'Monstera',
            scientific_name: ['Monstera deliciosa'],
            sunlight: 'Indirect Light',
            watering: 'Moderate'
        });
    });

    test('✅ Should fetch plant from Perenual', async () => {
        const res = await request(app).get('/api/plants/perenual/123');
        expect(res.status).toBe(200);
    });

    test('❌ Should return 404 for non-existent plant', async () => {
        fetchPlantFromPerenual.mockResolvedValue(null);
        const res = await request(app).get('/api/plants/perenual/999');
        expect(res.status).toBe(404);
    });
});

describe('🔹 User Routes', () => {
    test('✅ Should get user profile', async () => {
        db.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ name: 'Test User' }) }) })
        });
        const res = await request(app).get('/api/users/profile/123');
        expect(res.status).toBe(200);
    });

    test('❌ Should return 404 for non-existent user profile', async () => {
        db.collection.mockReturnValue({
            doc: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ exists: false }) })
        });
        const res = await request(app).get('/api/users/profile/999');
        expect(res.status).toBe(404);
    });
});
