'use client';

import React, { useState } from 'react';
import type { OrderItem } from '@/lib/types';

interface EmailSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderParsed: (order: OrderItem) => void;
}

export const EmailSimulatorModal: React.FC<EmailSimulatorModalProps> = ({
  isOpen,
  onClose,
  onOrderParsed,
}) => {
  const [userEmail, setUserEmail] = useState('user@ticketportal.com');
  const [subject, setSubject] = useState('You got order! Taylor Swift The Eras Tour');
  const [emailBody, setEmailBody] = useState(
    'Congratulations! You got order on StubHub.\nEvent: Taylor Swift | The Eras Tour 2026\nTickets: 2 Qty\nTotal Paid: $550.00\nURL: https://stubhub.com/taylor-swift-eras-tour'
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/email-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, subject, bodyText: emailBody }),
      });
      const data = await res.json();

      if (data.success && data.order) {
        onOrderParsed(data.order);
        onClose();
      } else {
        alert('Failed to parse email: ' + (data.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error parsing email: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 2100 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '520px',
          background: '#0B1222',
          border: '1.5px solid #10B981',
          boxShadow: '0 25px 70px rgba(16, 185, 129, 0.3)',
          borderRadius: '24px',
        }}
      >
        <div className="modal-header">
          <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <i className="fas fa-envelope-open-text" style={{ color: '#10B981' }}></i>
            Email Order Ingestion Test
          </h2>
          <button className="close-btn" onClick={onClose} style={{ color: '#94A3B8' }}>
            ✕
          </button>
        </div>

        <p className="modal-subtitle">
          Enter your email address and incoming email body to parse and launch the Order Popup!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ color: '#94A3B8' }}>Your Email Address</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="e.g. yourname@gmail.com"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.8rem' }}>
            <label style={{ color: '#94A3B8' }}>Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. You got order!"
              required
            />
          </div>

          <div className="form-group" style={{ marginTop: '0.8rem' }}>
            <label style={{ color: '#94A3B8' }}>Email Content / Body</label>
            <textarea
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.8rem 1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
              required
            />
          </div>

          <button
            type="submit"
            className="submit-event-btn"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
            }}
            disabled={loading}
          >
            {loading ? 'Parsing Email...' : 'Parse Email & Trigger Order Popup'}
          </button>
        </form>
      </div>
    </div>
  );
};
