import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './Auth.module.css'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });
      localStorage.setItem('token', response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılamadı.');
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
            <button className={`${styles.tab} ${styles.active}`}>Sign In</button>
            <Link to="/register" className={styles.tab}>Sign Up</Link>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <Link to="/forgot-password" className={styles.forgotLink}>Forgot Password?</Link>

            <button type="submit" className={styles.submitButton}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;