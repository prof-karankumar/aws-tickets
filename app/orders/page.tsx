'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LoginModal } from '@/components/LoginModal';
import { AddEventModal } from '@/components/AddEventModal';
import { BulkPasswordModal } from '@/components/BulkPasswordModal';
import { NewOrderModal } from '@/components/NewOrderModal';
import type { OrderItem, OrderRecord } from '@/lib/types';
import { useToast } from '@/context/ToastContext';
import { updateAllEventsStatusInDB } from '@/lib/supabaseClient';
import { getOrders, ORDER_UPDATED_EVENT, updateOrderStatus } from '@/lib/orderStore';
import { useAuth } from '@/context/AuthContext';

export default function OrdersPage() {
  const { showToast } = useToast();
  const { isLoggedIn, openLoginModal } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'Broadcasted' | 'Unbroadcasted' | null>(null);

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Accepted' | 'Rejected'>('All');
  const [activeModalOrder, setActiveModalOrder] = useState<OrderItem | null>(null);

  useEffect(() => {
    const sync = () => setOrders(getOrders().filter((order) => order.status !== 'Pending'));
    sync();
    window.addEventListener(ORDER_UPDATED_EVENT, sync);
    return () => window.removeEventListener(ORDER_UPDATED_EVENT, sync);
  }, []);

  // Lock this page behind login — anyone landing here directly gets the login prompt.
  useEffect(() => {
    if (!isLoggedIn) openLoginModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleAcceptOrder = (id: string) => {
    updateOrderStatus(id, 'Accepted');
  };

  const handleRejectOrder = (id: string) => {
    updateOrderStatus(id, 'Rejected');
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'All') return true;
    return o.status === activeTab;
  });

  const handleBulkConfirm = async (status: string) => {
    setBulkStatus(null);
    try {
      await updateAllEventsStatusInDB(status);
      showToast('Successfully updated all events.', 'success');
    } catch (error: any) {
      showToast('Could not update events: ' + (error?.message || 'please try again.'), 'error');
    }
  };

  return (
    <main>
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenBulkPasswordModal={(status) => setBulkStatus(status)}
      />

      <div className="back-nav">
        <Link href="/" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to Home
        </Link>
      </div>

      <div className="event-detail-container orders-page" style={{ maxWidth: '1050px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 className="theme-heading" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              <i className="fas fa-receipt" style={{ color: '#026CDF', marginRight: '0.6rem' }}></i>
              Total Orders
            </h1>
            <p className="theme-subtext" style={{ fontSize: '1rem', marginTop: '0.3rem' }}>
              Accepted and rejected orders from StubHub, SeatGeek, and Vivid Seats
            </p>
          </div>

          <button
            type="button"
            style={{
              padding: '0.85rem 1.6rem',
              borderRadius: '50px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
            }}
          >
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.8rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            paddingBottom: '1rem',
          }}
        >
          {(['All', 'Accepted', 'Rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '50px',
                border: activeTab === tab ? '1px solid #026CDF' : '1px solid rgba(255, 255, 255, 0.1)',
                background: activeTab === tab ? 'rgba(2, 108, 223, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === tab ? '#FFFFFF' : '#94A3B8',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              {tab} Orders
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.length === 0 ? (
            <div className="event-info-card" style={{ textAlign: 'center', padding: '3rem' }}>
              <h3 className="theme-subtext" style={{ border: 'none', margin: 0 }}>
                No orders found in {activeTab} section.
              </h3>
            </div>
          ) : (
            filteredOrders.map((ord) => (
              <div
                key={ord.id}
                className="event-info-card"
                style={{
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.2rem',
                  borderLeft:
                    ord.status === 'Accepted'
                      ? '5px solid #10B981'
                      : ord.status === 'Rejected'
                      ? '5px solid #EF4444'
                      : '5px solid #F59E0B',
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        padding: '0.3rem 0.8rem',
                        borderRadius: '50px',
                        background:
                          ord.exchange === 'StubHub'
                            ? 'linear-gradient(135deg, #6E2D8E, #411551)'
                            : ord.exchange === 'SeatGeek'
                            ? 'linear-gradient(135deg, #00C49F, #00887A)'
                            : 'linear-gradient(135deg, #E21836, #A60C22)',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                      }}
                    >
                      {ord.exchange}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 600 }}>
                      {ord.timeReceived}
                    </span>
                  </div>

                  <div className="theme-heading" style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                    {ord.eventName}
                  </div>

                  <a
                    href={ord.eventUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#60A5FA', fontSize: '0.85rem', textDecoration: 'underline', marginTop: '0.2rem', display: 'inline-block' }}
                  >
                    {ord.eventUrl}
                  </a>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                      Tickets
                    </div>
                    <div className="theme-heading" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                      {ord.quantity} Qty
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                      Total
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34D399' }}>
                      {ord.totalPrice}
                    </div>
                  </div>

                  <div>
                      <span
                        style={{
                          padding: '0.4rem 1rem',
                          borderRadius: '50px',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          background: ord.status === 'Accepted' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                          color: ord.status === 'Accepted' ? '#34D399' : '#F87171',
                          border: ord.status === 'Accepted' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                        }}
                      >
                        ● {ord.status}
                      </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <LoginModal />
      <AddEventModal />
      <NewOrderModal
        isOpen={!!activeModalOrder}
        order={activeModalOrder}
        onClose={() => setActiveModalOrder(null)}
        onAccept={handleAcceptOrder}
        onReject={handleRejectOrder}
      />
      <BulkPasswordModal
        targetStatus={bulkStatus}
        onClose={() => setBulkStatus(null)}
        onConfirm={handleBulkConfirm}
      />
    </main>
  );
}
