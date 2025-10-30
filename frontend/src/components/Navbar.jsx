import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

// Logo (Twitter/X logosu)
const Logo = () => (
  <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
    <path />
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
        <div className={styles.navLeft}>
          <div className={styles.logo}>
            <Logo />
            <span>Task Manager</span>
          </div>
          <div className={styles.navLinks}>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.activeLink : ''}>
              Dashboard
            </NavLink>
            <NavLink to="/tasks" className={({ isActive }) => isActive ? styles.activeLink : ''}>
              Tasks
            </NavLink>
            <NavLink to="/analysis" className={({ isActive }) => isActive ? styles.activeLink : ''}>
              Analysis
            </NavLink>
          </div>
        </div>

        <div className={styles.profileDropdown}>
          <button 
            className={styles.profileButton} 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
          </button>
          
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