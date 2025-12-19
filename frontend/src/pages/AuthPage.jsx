import React, { useState, useEffect } from 'react';
import Snowfall from 'react-snowfall';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaSun, FaMoon, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import styles from './AuthPage.module.css';
import mintLeafLogo from '../assets/logo.png';
import authIllustration from '../assets/christmasTree.gif';
import snowGround from '../assets/snowGround.png';

// İkonlar
const IconInput = ({ id, label, type, value, onChange, placeholder, autoComplete, required, icon: Icon, isPassword = false, showPassword, setShowPassword, customStyles }) => {

  const inputType = isPassword && !showPassword ? 'password' : 'text';

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrapper}>
        {/* Sol İkon */}
        <Icon className={styles.inputIconLeft} />

        <input
          type={inputType}
          id={id}
          name={id}
          className={`${styles.formInput} ${customStyles}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
        />

        {/* Sağ Göz İkonu */}
        {isPassword && (
          <span onClick={() => setShowPassword(!showPassword)} className={styles.eyeIcon}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        )}
      </div>
    </div>
  );
};

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // URL'e göre mod: /register => true, /login => false
  const isRegister = location.pathname === '/register';

  // State'ler
  const [siEmail, setSiEmail] = useState('');
  const [siPassword, setSiPassword] = useState('');
  const [suName, setSuName] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [suConfirmPassword, setSuConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [formNonce, setFormNonce] = useState(0);

  useEffect(() => {
    if (localStorage.getItem('token')) navigate('/dashboard');
  }, [navigate]);

  // View değişiminde state temizleme
  useEffect(() => {
    setMessage({ type: '', content: '' });
    setShowPassword(false);

    if (isRegister) {
      setSiEmail(''); setSiPassword('');
    } else {
      setSuName(''); setSuEmail(''); setSuPassword(''); setSuConfirmPassword('');
    }
    setFormNonce(n => n + 1);
  }, [isRegister]);

  const goSignIn = () => navigate('/login');
  const goSignUp = () => navigate('/register');

  // Form gönderildiğinde çalışacak ana fonksiyon
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (isRegister) {
      if (suPassword !== suConfirmPassword) {
        setMessage({ type: 'error', content: 'Passwords do not match.' });
        return;
      }
      try {
        await axios.post('http://localhost:5050/api/auth/register', {
          name: suName, email: suEmail, password: suPassword,
        });
        setMessage({ type: 'success', content: 'Registration successful! Please sign in.' });
        setSuName(''); setSuEmail(''); setSuPassword(''); setSuConfirmPassword('');
        goSignIn();
      } catch (err) {
        setMessage({ type: 'error', content: err.response?.data?.message || 'Registration failed.' });
      }
    } else {
      try {
        const { data } = await axios.post('http://localhost:5050/api/auth/login', {
          email: siEmail, password: siPassword,
        });
        localStorage.setItem('token', data.token);
        window.dispatchEvent(new CustomEvent('avatarUpdated'));
        navigate('/dashboard');
      } catch (err) {
        const resp = err?.response;
        const apiMsg = resp?.data?.message;
        if (resp?.status === 401 || /invalid credentials/i.test(apiMsg || '')) {
          setMessage({ type: 'error', content: 'Invalid credentials.' });
          return;
        }
        setMessage({ type: 'error', content: apiMsg || 'Login failed.' });
      }
    }
  };

  const formKey = `${isRegister ? 'signup' : 'signin'}-${formNonce}`;

  return (
    <div className={styles.authContainer}>
      <Snowfall
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1,
          pointerEvents: 'none'
        }}
        snowflakeCount={200}
        speed={[0.5, 0.8]}
        wind={[-0.2, 0.2]}
      />
      <img src={snowGround} alt="Snowy Ground" className={styles.snowGround} />
      {/* Sol Panel */}
      <div className={styles.leftPanel}>
        <img src={mintLeafLogo} alt="TaskMint Logo" className={styles.brandLogo} />
        <h1 className={styles.brandName}>TaskMint</h1>
        <p className={styles.tagline}>The easiest way to achieve your goals.</p>
      </div>

      <img src={authIllustration} alt="Christmas Tree" className={styles.heroImage} />

      {/* Sağ Panel (Formlar) */}
      <div className={styles.rightPanel}>

        <div className={styles.formWrapper}>
          {/* Sekmeler */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tabButton} ${!isRegister ? styles.active : ''}`}
              onClick={goSignIn}
            >
              Sign In
            </button>
            <button
              className={`${styles.tabButton} ${isRegister ? styles.active : ''}`}
              onClick={goSignUp}
            >
              Sign Up
            </button>
          </div>

          <h2 className={styles.formTitle}>{isRegister ? 'Create Your Account' : 'Sign In'}</h2>
          <p className={styles.formSubtitle}>{isRegister ? 'Get started now.' : 'Welcome back!'}</p>

          <form key={formKey} onSubmit={handleSubmit} autoComplete="on">
            {isRegister ? (
              <>
                {/* Name Girişi */}
                <IconInput
                  id="su-name" label="Name" type="text"
                  value={suName} onChange={(e) => setSuName(e.target.value)}
                  placeholder="Enter your name" autoComplete="section-signup name" required
                  icon={FaUser}
                  customStyles={styles.inputWithIcon}
                />

                {/* Email Girişi */}
                <IconInput
                  id="su-email" label="Email" type="email"
                  value={suEmail} onChange={(e) => setSuEmail(e.target.value)}
                  placeholder="example@email.com" autoComplete="section-signup email" required
                  icon={FaEnvelope}
                  customStyles={styles.inputWithIcon}
                />

                {/* Password Girişi */}
                <IconInput
                  id="su-password" label="Password" type="password"
                  value={suPassword} onChange={(e) => setSuPassword(e.target.value)}
                  placeholder="Enter password" autoComplete="section-signup new-password" required
                  icon={FaLock} isPassword showPassword={showPassword} setShowPassword={setShowPassword}
                  customStyles={styles.inputWithIcon}
                />

                {/* Confirm Password Girişi */}
                <IconInput
                  id="su-confirm" label="Confirm Password" type="password"
                  value={suConfirmPassword} onChange={(e) => setSuConfirmPassword(e.target.value)}
                  placeholder="Confirm password" autoComplete="section-signup new-password" required
                  icon={FaLock} isPassword showPassword={showPassword} setShowPassword={setShowPassword}
                  customStyles={styles.inputWithIcon}
                />
              </>
            ) : (
              <>
                {/* Email Girişi (Sign In) */}
                <IconInput
                  id="si-email" label="Email" type="email"
                  value={siEmail} onChange={(e) => setSiEmail(e.target.value)}
                  placeholder="example@email.com" autoComplete="section-signin email" required
                  icon={FaEnvelope}
                  customStyles={styles.inputWithIcon}
                />

                {/* Password Girişi (Sign In) */}
                <IconInput
                  id="si-password" label="Password" type="password"
                  value={siPassword} onChange={(e) => setSiPassword(e.target.value)}
                  placeholder="Enter password" autoComplete="section-signin current-password" required
                  icon={FaLock} isPassword showPassword={showPassword} setShowPassword={setShowPassword}
                  customStyles={styles.inputWithIcon}
                />
              </>
            )}

            {message.content && (
              <p className={message.type === 'error' ? styles.messageError : styles.messageSuccess}>
                {message.content}
              </p>
            )}

            <button type="submit" className={styles.submitButton}>
              {isRegister ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className={styles.toggleLinkContainer}>
            {isRegister ? (
              <>
                Already have an account?{' '}
                <button onClick={goSignIn} className={styles.toggleLink}>
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account?{' '}
                <button onClick={goSignUp} className={styles.toggleLink}>
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;