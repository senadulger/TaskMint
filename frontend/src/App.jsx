// src/App.jsx

import React from 'react';
// 1. Router için gerekli bileşenleri import et
import { Routes, Route } from 'react-router-dom';

// 2. Oluşturduğumuz sayfaları import et
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    // 3. Rota (adres) yapısını tanımla
    <Routes>
      {/* Tarayıcıda adres '/' (ana sayfa) veya '/login' ise LoginPage'i göster */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Tarayıcıda adres '/register' ise RegisterPage'i göster */}
      <Route path="/register" element={<RegisterPage />} />

      {/* Tarayıcıda adres '/dashboard' ise DashboardPage'i göster */}
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}

export default App;