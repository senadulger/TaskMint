import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import styles from './MainLayout.module.css';

const MainLayout = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.content}>
        <Outlet /> 
      </main>
    </div>
  );
};

export default MainLayout;