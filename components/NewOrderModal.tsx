'use client';

import React from 'react';
import { useToast } from '@/context/ToastContext';
import type { OrderItem } from '@/lib/types';

interface NewOrderModalProps {
  isOpen: boolean;
  order: OrderItem | null;
  onClose: () => void;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  order,
  onClose,
  onAccept,
  onReject,
}) => {
  const { showToast } = useToast();

  if (!isOpen || !order) {
    return null;
  }

  const handleAccept = () => {
    showToast('Order ACCEPTED: ' + order.eventName, 'broadcast-success');
    if (onAccept) onAccept(order.id);
    onClose();
  };

  const handleReject = () => {
    showToast('Order REJECTED: ' + order.eventName, 'unbroadcast-success');
    if (onReject) onReject(order.id);
    onClose();
  };

  const currentExchange = order.exchange;

  let exchangeColor = 'linear-gradient(135deg, #6E2D8E, #411551)';
  let exchangeIconClass = 'fas fa-ticket-alt';

  if (currentExchange === 'SeatGeek') {
    exchangeColor = 'linear-gradient(135deg, #00C49F, #00887A)';
    exchangeIconClass = 'fas fa-chair';
  } else if (currentExchange === 'Vivid Seats') {
    exchangeColor = 'linear-gradient(135deg, #E21836, #A60C22)';
    exchangeIconClass = 'fas fa-star';
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 2200 }}>
      <div
        className="modal-content"
        style={{
          maxWidth: '480px',
          background: '#0B1222',
          border: '1.5px solid #026CDF',
          boxShadow: '0 25px 70px rgba(2, 108, 223, 0.4)',
          borderRadius: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingBottom: '0.8rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10B981',
                display: 'inline-block',
                boxShadow: '0 0 10px #10B981',
                animation: 'pulseGreen 1.5s infinite',
              }}
            ></span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>
              NEW ORDER RECEIVED!
            </h2>
          </div>
          <button className="close-btn" onClick={onClose} style={{ color: '#94A3B8' }}>
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              Exchange Marketplace
            </span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.45rem 1rem',
                borderRadius: '50px',
                background: exchangeColor,
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.85rem',
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '7px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                }}
              >
                <i className={exchangeIconClass}></i>
              </span>
              {order.exchange}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              Order Number
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.3rem' }}>
              #{order.id}
            </div>
          </div>

          <div
            style={{
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              Event Name
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.3rem' }}>
              {order.eventName}
            </div>
          </div>

          <div
            style={{
              padding: '0.8rem 1rem',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
              Event URL
            </div>
            <a
              href={order.eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#60A5FA',
                fontSize: '0.9rem',
                fontWeight: 600,
                wordBreak: 'break-all',
                textDecoration: 'underline',
                marginTop: '0.2rem',
                display: 'inline-block',
              }}
            >
              {order.eventUrl}
            </a>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div
              style={{
                padding: '0.8rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                Quantity
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>
                {order.quantity} Tickets
              </div>
            </div>

            <div
              style={{
                padding: '0.8rem 1rem',
                background: 'rgba(255, 255, 255, 0.04)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                Total Price
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34D399', marginTop: '0.2rem' }}>
                {order.totalPrice}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={handleAccept}
            style={{
              padding: '0.9rem',
              borderRadius: '50px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
            }}
          >
            <i className="fas fa-check-circle" style={{ fontSize: '1.1rem' }}></i> ACCEPT
          </button>

          <button
            type="button"
            onClick={handleReject}
            style={{
              padding: '0.9rem',
              borderRadius: '50px',
              border: 'none',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            }}
          >
            <i className="fas fa-times-circle" style={{ fontSize: '1.1rem' }}></i> REJECT
          </button>
        </div>
      </div>
    </div>
  );
};
