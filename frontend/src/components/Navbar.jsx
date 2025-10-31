import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Logo = () => (
  <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
    <path  />
  </svg>
);

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContent}>
        {/* Sol Taraf: Logo ve Linkler */}
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <Logo />
            <span>Task Manager</span>
          </div>
          <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}>
            Tasks
          </NavLink>
          <NavLink to="/analysis" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.activeLink : ''}`}>
            Analysis
          </NavLink>
        </div>

        <div className={styles.profileDropdown}>
          <button 
            className={styles.profileButton} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
              <button onClick={handleSignOut}>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;