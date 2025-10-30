import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Auth.module.css'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        name,
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Kayıt oluşturulamadı.');
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.brandingSide}>
        <div className={styles.brandingContent}>
          <h1>Task Manager</h1>
          <p>Manage Your Tasks. Achieve Your Goals.</p>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.authContainer}>
          <div className={styles.tabContainer}>
            <Link to="/login" className={styles.tab}>Sign In</Link>
            <button className={`${styles.tab} ${styles.active}`}>Sign Up</button>
          </div>

          <h2>Create Your Account</h2>
          <p style={{ color: '#A0A0B8', marginBottom: '2rem' }}>Get started in seconds.</p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.passwordWrapper}>
              <label htmlFor="password">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className={styles.submitButton}>
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;