// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Stil kodlarını CSS Modülü olarak ekleyelim
import styles from './AuthForm.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); // Hata mesajları için state
  
  const navigate = useNavigate(); // Yönlendirme için hook

  const handleSubmit = async (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini engelle
    setError(null); // Eski hataları temizle

    try {
      // --- ENTEGRASYON ADIMI ---
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      // Başarılı olursa
      console.log('Giriş başarılı:', response.data);
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');

    } catch (err) {
      // Başarısız olursa
      console.error('Giriş hatası:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  return (
    // BU DIV'in doğru class'ı aldığından emin ol
    <div className={styles.authContainer}> 
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2>Giriş Yap</h2>
        
        {error && <div className={styles.errorBanner}>{error}</div>}

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
          Giriş Yap
        </button>
        <p className={styles.switchLink}>
          Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;