'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { isLoggedIn, logout, openLoginModal, openAddEventModal } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <nav className="navbar">
        <div className="brand-area">
          {isLoggedIn && (
            <button
              className="menu-toggle"
              id="menuToggleBtn"
              aria-label="Open navigation menu"
              onClick={onToggleSidebar}
            >
              <i className="fas fa-bars"></i>
            </button>
          )}
          <Link href="/" className="brand-home" aria-label="Go to home">
            🎫 TicketPortal
          </Link>
        </div>

        <div className="nav-links">
          {isLoggedIn && (
            <>
              <button
                type="button"
                onClick={openAddEventModal}
                className="nav-link-btn animated-action"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-color)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Add Events
              </button>
            </>
          )}

          <button
            type="button"
            className="login-btn"
            onClick={isLoggedIn ? logout : openLoginModal}
            style={{ cursor: 'pointer' }}
          >
            {isLoggedIn ? 'Logout' : 'Login'}
          </button>

          <button
            className="theme-toggle"
            id="themeToggleBtn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            <i className={`fas ${theme === 'light' ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>
        </div>
      </nav>
    </>
  );
};
