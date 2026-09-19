'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LoginModal } from '@/components/LoginModal';
import { AddEventModal } from '@/components/AddEventModal';
import { BulkPasswordModal } from '@/components/BulkPasswordModal';
import { useAuth } from '@/context/AuthContext';
import type { OrderItem, OrderRecord } from '@/lib/types';
import { addOrder, getOrders, ORDER_UPDATED_EVENT, updateOrderStatus } from '@/lib/orderStore';

const DEMO_SAMPLE_ORDERS: OrderItem[] = [
  {
    id: 'demo-201',
    eventName: 'Taylor Swift | The Eras Tour',
    eventUrl: 'https://stubhub.com/ed-sheeran-tickets',
    ticketmasterUrl: 'https://ticketmaster.com/taylor-swift-eras-tour',
    eventDateTime: 'Mar 14, 2026 · 7:30 PM',
    exchange: 'StubHub',
    quantity: 2,
    totalPrice: '$450.00',
    timeReceived: '2 mins ago',
  },
  {
    id: 'demo-202',
    eventName: 'Coldplay — Music of the Spheres',
    eventUrl: 'https://seatgeek.com/dua-lipa-tickets',
    ticketmasterUrl: 'https://ticketmaster.com/coldplay-tour',
    eventDateTime: 'Apr 02, 2026 · 8:00 PM',
    exchange: 'SeatGeek',
    quantity: 4,
    totalPrice: '$980.00',
    timeReceived: '14 mins ago',
  },
  {
    id: 'demo-203',
    eventName: 'Lakers vs Warriors',
    eventUrl: 'https://vividseats.com/yankees-redsox-tickets',
    ticketmasterUrl: 'https://ticketmaster.com/lakers-warriors',
    eventDateTime: 'Feb 20, 2026 · 7:00 PM',
    exchange: 'Vivid Seats',
    quantity: 2,
    totalPrice: '$310.00',
    timeReceived: '41 mins ago',
  },
];

export default function NewOrdersPage() {
  const { isLoggedIn, openLoginModal } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'Broadcasted' | 'Unbroadcasted' | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  useEffect(() => {
    const sync = () => setOrders(getOrders().filter((order) => order.status === 'Pending'));
    sync();
    window.addEventListener(ORDER_UPDATED_EVENT, sync);
    return () => window.removeEventListener(ORDER_UPDATED_EVENT, sync);
  }, []);

  // If someone lands directly on this URL without logging in, send them to the login modal.
  useEffect(() => {
    if (!isLoggedIn) {
      openLoginModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const changeStatus = (id: string, status: 'Accepted' | 'Rejected') => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    updateOrderStatus(id, status);
  };

  const showDemoOrder = () => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    const random = DEMO_SAMPLE_ORDERS[Math.floor(Math.random() * DEMO_SAMPLE_ORDERS.length)];
    addOrder({
      ...random,
      id: `demo-${Date.now()}`,
      timeReceived: 'Just now (Demo)',
      status: 'Pending',
    });
  };

  return (
    <main>
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onOpenBulkPasswordModal={setBulkStatus} />
      <div className="back-nav"><Link href="/" className="back-link"><i className="fas fa-arrow-left"></i> Back to Home</Link></div>

      <section className={`orders-page ${!isLoggedIn ? 'orders-page-locked' : ''}`}>
        <div className="orders-page-header">
          <div>
            <h1 className="theme-heading"><i className="fas fa-bell"></i> New Orders</h1>
            <p className="theme-subtext">Orders stay here until you accept or reject them.</p>
          </div>
          <div className="orders-page-header-right">
            <button type="button" className="demo-order-button" onClick={showDemoOrder}>
              <i className="fas fa-clapperboard"></i> Show Demo Order
            </button>
            <span className="order-count-badge">{isLoggedIn ? orders.length : 0} Pending</span>
          </div>
        </div>

        {!isLoggedIn ? (
          <div className="event-info-card empty-orders">
            <i className="fas fa-lock"></i>
            <h3>Login required</h3>
            <p>Please login to view and manage orders.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="event-info-card empty-orders"><i className="fas fa-inbox"></i><h3>No new orders</h3><p>New incoming orders will appear here as cards.</p></div>
        ) : (
          <div className="new-orders-grid">
            {orders.map((order) => (
              <article className="new-order-card" key={order.id}>
                <div className="new-order-card-top">
                  <span className={`exchange-badge exchange-${order.exchange.replace(/\s/g, '').toLowerCase()}`}>
                    <i className="fas fa-ticket-alt"></i> {order.exchange}
                  </span>
                  <span className="order-time">{order.timeReceived}</span>
                </div>
                <span className="order-number">Order #{order.id}</span>
                <h2>{order.eventName}</h2>
                <div className="order-event-dt"><i className="fas fa-calendar-days"></i> {order.eventDateTime}</div>
                <a href={order.ticketmasterUrl} target="_blank" rel="noopener noreferrer">{order.ticketmasterUrl}</a>
                <div className="new-order-meta"><span><small>Tickets</small><strong>{order.quantity}</strong></span><span><small>Total</small><strong className="price">{order.totalPrice}</strong></span></div>
                <div className="new-order-actions">
                  <button className="order-accept-btn" onClick={() => changeStatus(order.id, 'Accepted')}><i className="fas fa-check"></i> Accept</button>
                  <button className="order-reject-btn" onClick={() => changeStatus(order.id, 'Rejected')}><i className="fas fa-xmark"></i> Reject</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <LoginModal />
      <AddEventModal />
      <BulkPasswordModal targetStatus={bulkStatus} onClose={() => setBulkStatus(null)} onConfirm={() => setBulkStatus(null)} />
    </main>
  );
}
