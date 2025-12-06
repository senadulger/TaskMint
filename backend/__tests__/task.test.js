const request = require('supertest');
const app = require('../index'); 
const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const path = require('path');
const fs = require('fs');

let token;
const userEmail = "tasktester@example.com";
const tempFilePath = path.join(__dirname, 'temp_test_file.pdf'); //geçici bir pdf dosyası

// Testler başlamadan önce yapılacak hazırlıklar
beforeAll(async () => {
    // 1. Sahte bir PDF dosyası oluştur (İçine rastgele yazı yaz)
    fs.writeFileSync(tempFilePath, 'Bu bir test dosyasidir.');

    // 2. Varsa eski kullanıcıyı temizle
    await User.findOneAndDelete({ email: userEmail });
    
    // 3. Kullanıcı oluştur ve giriş yap
    await request(app).post('/api/auth/register').send({
        name: "Task Tester",
        email: userEmail,
        password: "123"
    });

    const loginRes = await request(app).post('/api/auth/login').send({
        email: userEmail,
        password: "123"
    });

    token = loginRes.body.token;
});

// Testler bitince yapılacak temizlik
afterAll(async () => {
    const user = await User.findOne({ email: userEmail });
    if(user) {
        await Task.deleteMany({ user: user._id });
        await User.findOneAndDelete({ email: userEmail });
    }
    
    // Test bitince oluşturduğumuz sahte dosyayı sil
    if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
    }

    await mongoose.connection.close();
});

describe('Task API Endpoints', () => {

    let taskId;

    // TEST 1: Dosyalı Görev Oluşturma
    it('POST /api/tasks - Should create a task with attachment', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Test Task with File')
            .field('category', 'Job')
            .field('status', 'Incomplete')
            .field('description', 'Testing file upload via Jest')
            .attach('attachments', tempFilePath); 

        // Hata ayıklama: Eğer 500 alırsak hatayı görelim
        if (res.statusCode !== 201) {
            console.error("Test Hatası Detayı:", res.body);
        }

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe('Test Task with File');
        
        expect(res.body.attachments).toBeDefined();
        expect(res.body.attachments.length).toBeGreaterThan(0);
        
        taskId = res.body._id;
    });

    // TEST 2: Görevleri Listeleme
    it('GET /api/tasks - Should get all tasks for user', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBeGreaterThan(0);
    });

    // TEST 3: Görev Güncelleme
    it('PUT /api/tasks/:id - Should update a task', async () => {
        const res = await request(app)
            .put(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'Completed',
                title: 'Updated Title'
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toBe('Completed');
        expect(res.body.title).toBe('Updated Title');
    });

    // TEST 4: Görev Silme
    it('DELETE /api/tasks/:id - Should delete a task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toEqual(200);
    });
});