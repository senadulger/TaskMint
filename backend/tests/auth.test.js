const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const authRoutes = require('../routes/authRoutes');

// Express uygulamasının bir kopyasını oluşturup test için hazırlıyoruz
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Test veritabanını her testten önce temizleyelim
beforeEach(async () => {
  await User.deleteMany({});
});

describe('Auth API Endpointleri', () => {
  
  // Test 1: Yeni kullanıcı kaydı
  it('POST /api/auth/register -> Yeni kullanıcı kaydetmeli', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Kullanıcı',
        email: 'test@mail.com',
        password: '123456',
      });
    
    expect(response.statusCode).toBe(201); // 201 (Oluşturuldu) mu?
    expect(response.body).toHaveProperty('token'); // Token döndü mü?
    expect(response.body.name).toBe('Test Kullanıcı'); // İsim doğru mu?
  });

  // Test 2: Başarılı giriş
  it('POST /api/auth/login -> Başarılı giriş yapmalı', async () => {
    // Önce bir kullanıcı kaydedelim
    await request(app).post('/api/auth/register').send({
      name: 'Test Kullanıcı',
      email: 'test@mail.com',
      password: '123456',
    });

    // Şimdi giriş yapmayı deneyelim
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@mail.com',
        password: '123456',
      });

    expect(response.statusCode).toBe(200); // 200 (OK) mu?
    expect(response.body).toHaveProperty('token'); // Token döndü mü?
  });

  // Test 3: Geçersiz (Hatalı Şifre) giriş (Final Req. 2'nin parçası)
  it('POST /api/auth/login -> Hatalı şifre ile başarısız olmalı', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test Kullanıcı',
      email: 'test@mail.com',
      password: '123456',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@mail.com',
        password: 'YANLISSIFRE', // Hatalı şifre
      });

    expect(response.statusCode).toBe(400); // 400 (Bad Request) mi?
    expect(response.body.message).toBe('Geçersiz email veya şifre');
  });
});