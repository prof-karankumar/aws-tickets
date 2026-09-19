'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { EmailSimulatorModal } from '@/components/EmailSimulatorModal';
import { addOrder } from '@/lib/orderStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBulkPasswordModal: (status: 'Broadcasted' | 'Unbroadcasted') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  onOpenBulkPasswordModal,
}) => {
  const router = useRouter();
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isEmailSimOpen, setIsEmailSimOpen] = useState(false);
  const { openAddEventModal, isLoggedIn, openLoginModal } = useAuth();

  const guard = (action: () => void) => {
    if (!isLoggedIn) {
      onClose();
      openLoginModal();
      return;
    }
    action();
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <h2>Navigation</h2>
          <button
            className="sidebar-close"
            id="sidebarCloseBtn"
            aria-label="Close navigation menu"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <Link href="/" className="sidebar-link" onClick={onClose}>
          <i className="fas fa-house"></i> Home
        </Link>
        <Link
          href="/new-orders"
          className={`sidebar-link ${!isLoggedIn ? 'sidebar-link-locked' : ''}`}
          onClick={(e) => {
            if (!isLoggedIn) { e.preventDefault(); guard(() => {}); return; }
            onClose();
          }}
        >
          <i className="fas fa-receipt"></i> New Orders {!isLoggedIn && <i className="fas fa-lock" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}></i>}
        </Link>
        <Link
          href="/orders"
          className={`sidebar-link ${!isLoggedIn ? 'sidebar-link-locked' : ''}`}
          onClick={(e) => {
            if (!isLoggedIn) { e.preventDefault(); guard(() => {}); return; }
            onClose();
          }}
        >
          <i className="fas fa-receipt"></i> Total Orders {!isLoggedIn && <i className="fas fa-lock" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}></i>}
        </Link>
        <Link
          href="/total-events"
          className={`sidebar-link ${!isLoggedIn ? 'sidebar-link-locked' : ''}`}
          onClick={(e) => {
            if (!isLoggedIn) { e.preventDefault(); guard(() => {}); return; }
            onClose();
          }}
        >
          <i className="fas fa-calendar-days"></i> Total Events {!isLoggedIn && <i className="fas fa-lock" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}></i>}
        </Link>
        <Link href="#" className={`sidebar-link ${!isLoggedIn ? 'sidebar-link-locked' : ''}`} onClick={(e) => { if (!isLoggedIn) { e.preventDefault(); guard(() => {}); return; } onClose(); }}>
          <i className="fas fa-file-lines"></i> Logs {!isLoggedIn && <i className="fas fa-lock" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}></i>}
        </Link>
        <Link href="#" className={`sidebar-link ${!isLoggedIn ? 'sidebar-link-locked' : ''}`} onClick={(e) => { if (!isLoggedIn) { e.preventDefault(); guard(() => {}); return; } onClose(); }}>
          <i className="fas fa-user-clock"></i> Login Activity {!isLoggedIn && <i className="fas fa-lock" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}></i>}
        </Link>
        <button
          type="button"
          className={`sidebar-link sidebar-action-button ${!isLoggedIn ? 'sidebar-link-locked' : ''}`}
          onClick={() => guard(() => setIsEmailSimOpen(true))}
        >
          <i className="fas fa-envelope-open-text"></i> Email Webhook {!isLoggedIn && <i className="fas fa-lock" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}></i>}
        </button>

        <button
          className="sidebar-menu-button"
          id="bulkActionToggle"
          aria-expanded={isBulkMenuOpen}
          onClick={() => guard(() => setIsBulkMenuOpen(!isBulkMenuOpen))}
        >
          <span>
            <i className="fas fa-layer-group"></i> Bulk Actions {!isLoggedIn && <i className="fas fa-lock" style={{ fontSize: '0.75rem' }}></i>}
          </span>
          <i className={`fas fa-chevron-${isBulkMenuOpen ? 'up' : 'down'}`}></i>
        </button>

        <div className={`bulk-action-menu ${isBulkMenuOpen ? 'open' : ''}`}>
          <button
            className="bulk-broadcast"
            onClick={() => guard(() => { onClose(); onOpenBulkPasswordModal('Broadcasted'); })}
          >
            <i className="fas fa-broadcast-tower"></i> Broadcast All Events
          </button>
          <button
            className="bulk-unbroadcast"
            onClick={() => guard(() => { onClose(); onOpenBulkPasswordModal('Unbroadcasted'); })}
          >
            <i className="fas fa-stop"></i> Unbroadcast All Events
          </button>
        </div>
      </aside>

      <div
        className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
        id="sidebarOverlay"
        onClick={onClose}
      ></div>

      <EmailSimulatorModal
        isOpen={isEmailSimOpen}
        onClose={() => setIsEmailSimOpen(false)}
        onOrderParsed={(parsedOrder) => {
          addOrder({ ...parsedOrder, status: 'Pending' });
          setIsEmailSimOpen(false);
          router.push('/new-orders');
        }}
      />

    </>
  );
};
