'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      setError(false);
      setUsername('');
      setPassword('');
    } else {
      setError(true);
    }
  };

  return (
    <div id="loginModal" className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-lock"></i> Login Portal
          </h2>
          <button
            type="button"
            className="close-btn"
            onClick={() => {
              setError(false);
              closeLoginModal();
            }}
          >
            ✕
          </button>
        </div>

        <p className="modal-subtitle">
        Enter your username and password to access the Event Portal.
        </p>

        <form id="loginForm" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p
              id="loginError"
              style={{ color: '#ff5555', marginTop: '1rem' }}
            >
              Incorrect username or password.
            </p>
          )}

          <button type="submit" className="submit-event-btn">
            <i className="fas fa-sign-in-alt"></i> Login
          </button>
        </form>
      </div>
    </div>
  );
};
