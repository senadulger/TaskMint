const request = require('supertest');
const app = require('../index'); 
const mongoose = require('mongoose');
const User = require('../models/User');

// Test verisi
const userData = {
    name: "Test User",
    email: "testuser_unique@example.com", // Benzersiz bir mail
    password: "password123"
};

beforeAll(async () => {
    // Test başlamadan önce varsa eski test kullanıcısını sil
    await User.findOneAndDelete({ email: userData.email });
});

afterAll(async () => {
    // Test bitince veritabanı bağlantısını kapat
    await mongoose.connection.close();
});

describe('Auth API Tests', () => {

    it('POST /api/auth/register - Should register a new user', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send(userData);
        
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('role', 'user'); // Varsayılan rol kontrolü
    });

    it('POST /api/auth/login - Should login existing user', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: userData.password
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });

    it('POST /api/auth/login - Should reject wrong password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: userData.email,
                password: "wrongpassword"
            });

        expect(res.statusCode).toEqual(401); // Unauthorized
    });
});