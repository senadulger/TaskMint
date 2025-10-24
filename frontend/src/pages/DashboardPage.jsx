// src/pages/DashboardPage.jsx

import React from 'react';

const DashboardPage = () => {
  
  // Token'ı al (gerçek uygulamada burada token kontrolü yapılır)
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    // Sayfayı yenileyerek login'e at (şimdilik en basit yöntem)
    window.location.href = '/login'; 
  };

  if (!token) {
    return (
      <div>
        <h1>Yetkisiz Erişim</h1>
        <p>Lütfen giriş yapın.</p>
        <a href="/login">Giriş Yap</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Giriş başarılı! Burası görev listesi sayfası.</p>
      <p style={{ marginTop: '20px', wordBreak: 'break-all' }}>
        <strong>Token'ınız:</strong> {token}
      </p>
      <button 
        onClick={handleLogout} 
        style={{ marginTop: '20px', padding: '10px', cursor: 'pointer' }}
      >
        Çıkış Yap
      </button>
    </div>
  );
};

export default DashboardPage;