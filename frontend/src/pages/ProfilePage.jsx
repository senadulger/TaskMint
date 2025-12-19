import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ProfilePage.module.css';
import { useNavigate } from 'react-router-dom';

import bearAvatar from '../assets/bear.png';
import beeAvatar from '../assets/bee.png';
import foxAvatar from '../assets/fox.png';
import pandaAvatar from '../assets/panda.png';

const avatars = [
  { name: 'Bear', src: bearAvatar },
  { name: 'Bee', src: beeAvatar },
  { name: 'Fox', src: foxAvatar },
  { name: 'Panda', src: pandaAvatar },
];

const ProfilePage = () => {
  // Profil Formu State'leri
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('Bear');

  // Şifre Formu State'leri
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Yüklenme ve Mesaj State'leri
  const [loading, setLoading] = useState(true);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const navigate = useNavigate();

  // Sayfa Yüklendiğinde: Backend'den mevcut profil verisini çek
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get('http://localhost:5050/api/auth/profile', config);

        setName(data.name);
        setEmail(data.email);
        setSelectedAvatar(data.avatar || 'Bear');
        setLoading(false);
      } catch (error) {
        console.error('Could not fetch profile', error);
        setProfileMessage(error.response?.data?.message || 'Error fetching profile.');
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  // Profil Güncelleme (İsim / Avatar) Fonksiyonu
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.put(
        'http://localhost:5050/api/auth/profile',
        { name, avatar: selectedAvatar },
        config
      );

      localStorage.setItem('token', data.token);
      window.dispatchEvent(new CustomEvent('avatarUpdated'));
      setProfileMessage('Profile updated successfully!');
    } catch (error) {
      setProfileMessage(error.response?.data?.message || 'Error updating profile.');
    }
  };

  // Şifre Değiştirme Fonksiyonu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(''); // Önceki mesajı temizle

    if (newPassword !== confirmPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        'http://localhost:5050/api/auth/password',
        { currentPassword, newPassword },
        config
      );

      setPasswordMessage('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || 'Error changing password.');
    }
  };

  // Yüklenme ekranı
  if (loading) {
    return <div className={styles.loadingContainer}>Loading profile...</div>;
  }

  return (
    <div className={styles.profileContainer}>

      {/* --- BAŞLIK YAPISI --- */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Profile Settings</h1>
        <p className={styles.pageSubtitle}>Update your name, password, and choose a profile image.</p>
      </div>

      {/* Profil Ayarları (İsim/Avatar) */}
      <div className={styles.formSection}>

        <form onSubmit={handleProfileUpdate} className={styles.innerForm}>
          {/* Avatar Seçimi */}
          <div className={styles.avatarSection}>
            <h3 className={styles.avatarTitle}>Profile Image</h3>
            <p className={styles.avatarDescription}>Choose one of the images below.</p>
            <div className={styles.avatarList}>
              {avatars.map((avatar) => (
                <div
                  key={avatar.name}
                  className={`${styles.avatarItem} ${selectedAvatar === avatar.name ? styles.avatarSelected : ''}`}
                  onClick={() => setSelectedAvatar(avatar.name)}
                >
                  <div className={styles.avatarImageContainer}>
                    <img
                      src={avatar.src}
                      alt={avatar.name}
                      className={styles.avatarImage}
                    />
                  </div>

                  <span>{avatar.name}</span>

                  {selectedAvatar === avatar.name && (
                    <div className={styles.checkIcon}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* İsim */}
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>Name</label>
            <input
              type="text"
              id="name"
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email (cannot be changed)</label>
            <input
              type="email"
              id="email"
              className={`${styles.formInput} ${styles.disabledInput}`}
              value={email}
              disabled
            />
          </div>

          {/* Profil Mesajı (Başarı/Hata) */}
          {profileMessage && (
            <p className={profileMessage.includes('successfully') ? styles.messageSuccess : styles.messageError}>
              {profileMessage}
            </p>
          )}

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              Save Profile
            </button>
          </div>
        </form>
      </div>

      {/* Şifre Değiştirme */}
      <div className={styles.formSection}>
        <h2 className={styles.sectionTitle}>Change Password</h2>
        <p className={styles.sectionSubtitle}>Update your password to keep your account secure.</p>

        <form onSubmit={handleChangePassword} className={styles.innerForm}>
          <div className={styles.passwordGrid}>
            {/* Current Password */}
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword" className={styles.formLabel}>Current Password</label>
              <input
                type="password"
                id="currentPassword"
                className={styles.formInput}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                required
              />
            </div>
            {/* New Password */}
            <div className={styles.formGroup}>
              <label htmlFor="newPassword" className={styles.formLabel}>New Password</label>
              <input
                type="password"
                id="newPassword"
                className={styles.formInput}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
            </div>
            {/* Confirm New Password */}
            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.formLabel}>Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                className={styles.formInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          {/* Şifre Mesajı (Başarı/Hata) */}
          {passwordMessage && (
            <p className={passwordMessage.includes('successfully') ? styles.messageSuccess : styles.messageError}>
              {passwordMessage}
            </p>
          )}

          <div className={styles.buttonContainer}>
            <button type="submit" className={styles.saveButton}>
              Change Password
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default ProfilePage;