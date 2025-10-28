const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const authRoutes = require('../routes/authRoutes');
const taskRoutes = require('../routes/taskRoutes');

// Express uygulamasının bir kopyasını oluşturuyoruz
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes); // Auth rotalarına da ihtiyacımız var (token almak için)
app.use('/api/tasks', taskRoutes);

let token; // Testlerde kullanmak için token
let userId; // Testlerde kullanmak için kullanıcı ID'si

// Her testten önce veritabanını temizle ve bir kullanıcı oluşturup token al
beforeEach(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});

  // 1. Kullanıcıyı oluştur
  const userResponse = await request(app).post('/api/auth/register').send({
    name: 'Test Kullanıcı',
    email: 'test@mail.com',
    password: '123456',
  });
  
  userId = userResponse.body._id;
  token = userResponse.body.token; // Token'ı al
});


describe('Task API Endpointleri', () => {

  // Test 1: Token olmadan görevlere erişimi engelle
  it('GET /api/tasks -> Token olmadan erişimi engellemeli', async () => {
    const response = await request(app).get('/api/tasks');
    expect(response.statusCode).toBe(401); // 401 (Yetkisiz) mi?
  });

  // Test 2: Yeni görev oluşturma
  it('POST /api/tasks -> Yeni görev oluşturmalı', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`) // Token'ı header'a ekle
      .send({
        title: 'Jest Testi Yaz',
        category: 'Test',
        status: 'In Progress',
      });
      
    expect(response.statusCode).toBe(201); // 201 (Oluşturuldu) mu?
    expect(response.body.title).toBe('Jest Testi Yaz');
    expect(response.body.user.toString()).toBe(userId); // Görev doğru kullanıcıya mı ait?
  });

  // Test 3: Görevleri listeleme
  it('GET /api/tasks -> Kullanıcının görevlerini listelemeli', async () => {
    // Önce bir görev ekleyelim
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Görev 1', category: 'Test', status: 'Pending' });

    // Şimdi görevleri isteyelim
    const response = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1); // Listede 1 görev mi var?
    expect(response.body[0].title).toBe('Görev 1');
  });

  // Test 4: Görev silme
  it('DELETE /api/tasks/:id -> Görevi silmeli', async () => {
    // 1. Görev oluştur
    const postResponse = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Silinecek Görev', category: 'Test', status: 'Pending' });

    const taskId = postResponse.body._id; // Oluşturulan görevin ID'si

    // 2. Görevi sil
    const deleteResponse = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.body.message).toBe('Görev başarıyla silindi');

    // 3. Görevin gerçekten silindiğini kontrol et
    const getResponse = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    
    expect(getResponse.body.length).toBe(0); // Liste boş mu?
  });
});