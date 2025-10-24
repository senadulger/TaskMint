// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Giriş sayfasıyla aynı stili kullan
import styles from './AuthForm.module.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // --- ENTEGRASYON ADIMI ---
      // Backend'deki /api/auth/register endpoint'ine istek at
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });

      // Başarılı olursa (Vize Req. 3)
      console.log('Kayıt başarılı:', response.data);
      
      // Gelen token'ı kaydet
      localStorage.setItem('token', response.data.token);
      
      // Kullanıcıyı Dashboard'a yönlendir
      navigate('/dashboard');

    } catch (err) {
      // Başarısız olursa (örn: email zaten alınmış)
      console.error('Kayıt hatası:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Kayıt Ol</h2>
        
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.formGroup}>
          <label htmlFor="name">İsim</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Şifre</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.submitButton}>
          Kayıt Ol
        </button>
        <p className={styles.switchLink}>
          Zaten bir hesabınız var mı? <Link to="/login">Giriş Yapın</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;