import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import styles from './Navbar.module.css';
import { jwtDecode } from 'jwt-decode';
import ThemeToggle from './ThemeToggle';

import logoImage from '../assets/logo.png';

import bearAvatar from '../assets/bear.png';
import beeAvatar from '../assets/bee.png';
import foxAvatar from '../assets/fox.png';
import pandaAvatar from '../assets/panda.png';

const Logo = () => (
  <img src={logoImage} alt="TaskMintLogo" className={styles.logoImage} />
);

const avatarMap = {
  'Bear': bearAvatar,
  'Bee': beeAvatar,
  'Fox': foxAvatar,
  'Panda': pandaAvatar,
};

const getAvatarFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.avatar || 'Bear';
    } catch (error) {
      console.error("Failed to decode token:", error);
      return 'Bear';
    }
  }
  return 'Bear';
};

const getNameFromToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken.name || '';
    } catch (error) {
      return '';
    }
  }
  return '';
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [currentAvatarName, setCurrentAvatarName] = useState(getAvatarFromToken());
  const [profileAvatarSrc, setProfileAvatarSrc] = useState(avatarMap[currentAvatarName]);
  const [userName, setUserName] = useState(getNameFromToken());

  useEffect(() => {
    setProfileAvatarSrc(avatarMap[currentAvatarName]);
  }, [currentAvatarName]);

  // localStorage değişikliklerini dinleyen 'useEffect'
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        setCurrentAvatarName(getAvatarFromToken());
        setUserName(getNameFromToken());
      }
    };
    const handleAvatarUpdated = () => {
      setCurrentAvatarName(getAvatarFromToken());
      setUserName(getNameFromToken());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('avatarUpdated', handleAvatarUpdated);

    setCurrentAvatarName(getAvatarFromToken());
    setUserName(getNameFromToken());

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('avatarUpdated', handleAvatarUpdated);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    setCurrentAvatarName('Bear');
    setUserName('');
    setIsDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Sol Taraf */}
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <Logo />
            <span>TaskMint</span>
          </div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/analysis"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.activeLink : ''}`
            }
          >
            Analysis
          </NavLink>
          {getAvatarFromToken() && (
            (() => {
              const token = localStorage.getItem('token');
              if (token) {
                try {
                  const decoded = jwtDecode(token);
                  if (decoded.role === 'admin') {
                    return (
                      <NavLink
                        to="/admin"
                        className={({ isActive }) =>
                          `${styles.navLink} ${isActive ? styles.activeLink : ''}`
                        }
                      >
                        Admin Panel
                      </NavLink>
                    );
                  }
                } catch (e) { }
              }
              return null;
            })()
          )}
        </div>

        {/* SAĞ TARAF */}
        <div className={styles.navRight}>

          {/* Welcome Message */}
          {userName && (
            <span style={{ marginRight: '15px', color: 'var(--text-navbar)', fontWeight: '500' }}>
              Welcome, {userName}
            </span>
          )}

          {/* Profil Dropdown  */}
          <div className={styles.profileDropdown}>
            <button
              className={styles.profileButton}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 150)}
            >
              {profileAvatarSrc ? (
                <img src={profileAvatarSrc} alt="Profile Avatar" className={styles.profileImage} />
              ) : (
                <div className={styles.profilePlaceholder}></div>
              )}
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link
                  to="/profile"
                  className={styles.dropdownLink}
                  onClick={() => setIsDropdownOpen(false)}
                >
                  Profile Settings
                </Link>
                <button onClick={handleSignOut} className={styles.dropdownButton}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
          <ThemeToggle />

        </div>
      </div>
    </nav>
  );
};

export default Navbar;