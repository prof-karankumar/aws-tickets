'use client';

import React, { useState } from 'react';

interface BulkPasswordModalProps {
  targetStatus: 'Broadcasted' | 'Unbroadcasted' | null;
  onClose: () => void;
  onConfirm: (status: 'Broadcasted' | 'Unbroadcasted') => void;
}

export const BulkPasswordModal: React.FC<BulkPasswordModalProps> = ({
  targetStatus,
  onClose,
  onConfirm,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!targetStatus) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== 'aws-atm') {
      setError(true);
      return;
    }
    setError(false);
    setPassword('');
    onConfirm(targetStatus);
  };

  return (
    <div className="modal-overlay bulk-password-modal">
      <div className="modal-content" style={{ maxWidth: '420px' }}>
        <div className="modal-header">
          <h2>
            <i className="fas fa-lock"></i> Confirm Bulk Action
          </h2>
          <button
            className="close-btn"
            type="button"
            onClick={() => {
              setError(false);
              setPassword('');
              onClose();
            }}
          >
            ✕
          </button>
        </div>
        <p className="modal-subtitle">
          Enter the security password to update all events.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="bulkPassword">Password</label>
            <input
              type="password"
              id="bulkPassword"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              required
            />
          </div>
          {error && (
            <p
              className="bulk-password-error"
              style={{ color: '#ff5555', marginTop: '1rem' }}
            >
              Invalid password.
            </p>
          )}
          <button type="submit" className="submit-event-btn">
            <i className="fas fa-check"></i> Confirm
          </button>
        </form>
      </div>
    </div>
  );
};
