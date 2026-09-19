'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LoginModal } from '@/components/LoginModal';
import { AddEventModal } from '@/components/AddEventModal';
import { BulkPasswordModal } from '@/components/BulkPasswordModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getAllEventsFromDB, updateAllEventsStatusInDB } from '@/lib/supabaseClient';

export default function HomePage() {
  const router = useRouter();
  const { isLoggedIn, openLoginModal } = useAuth();
  const { showToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'Broadcasted' | 'Unbroadcasted' | null>(null);

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAll: 0,
    totalBroadcasted: 0,
    totalUnbroadcasted: 0,
    upcoming: 0,
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllEventsFromDB();

      const totalAll = data.length;
      const totalBroadcasted = data.filter((e) => e.event_status === 'Broadcasted').length;
      const totalUnbroadcasted = data.filter((e) => e.event_status === 'Unbroadcasted').length;

      const now = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(now.getDate() + 3);

      const upcoming = data.filter((e) => {
        if (!e.event_start_time) return false;
        const eventDate = new Date(e.event_start_time);
        return eventDate >= now && eventDate <= threeDaysLater;
      }).length;

      setStats({
        totalAll,
        totalBroadcasted,
        totalUnbroadcasted,
        upcoming,
      });
    } catch (error: any) {
      showToast(`Could not load dashboard data: ${error?.message || 'please try again.'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, fetchDashboardData]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isLoggedIn) {
        fetchDashboardData();
      }
    };
    const handleFocus = () => {
      if (isLoggedIn) {
        fetchDashboardData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isLoggedIn, fetchDashboardData]);

  const handleBulkConfirm = async (status: 'Broadcasted' | 'Unbroadcasted') => {
    setBulkStatus(null);
    showToast(
      `Updating all events to ${status === 'Broadcasted' ? 'Broadcasted' : 'Unbroadcasted'}...`,
      status === 'Broadcasted' ? 'broadcast-success' : 'unbroadcast-success'
    );

    try {
      await updateAllEventsStatusInDB(status);
      showToast(
        `Successfully ${status === 'Broadcasted' ? 'broadcasted' : 'unbroadcasted'} all events.`,
        status === 'Broadcasted' ? 'broadcast-success' : 'unbroadcast-success'
      );
      fetchDashboardData();
    } catch (error: any) {
      showToast(`Could not update events: ${error?.message || 'please try again.'}`, 'error');
      fetchDashboardData();
    }
  };

  const handleCardClick = (filter: string) => {
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }
    router.push(`/total-events?filter=${filter}`);
  };

  return (
    <main>
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenBulkPasswordModal={(status) => setBulkStatus(status)}
      />

      <div className="dashboard-title">
        <h1>
          <span style={{ fontSize: '3.2rem', marginTop: '0.5rem', display: 'block' }}>
            LISTING PORTAL
          </span>
        </h1>
      </div>

      <div className="container">
        {loading ? (
          <>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </>
        ) : (
          <>
            <div
              className={`card dashboard-card-1 ${!isLoggedIn ? 'card-locked' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCardClick('all')}
            >
              <h2>
                Total Events: {!isLoggedIn && <i className="fas fa-lock" style={{ fontSize: '0.9rem' }}></i>}
                <span style={{ fontSize: '1.6rem', display: 'block', marginTop: '6px', color: '#FFFFFF', fontWeight: 800 }}>
                  {isLoggedIn ? stats.totalAll : 0}
                </span>
              </h2>
            </div>

            <div
              className={`card dashboard-card-2 ${!isLoggedIn ? 'card-locked' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCardClick('broadcasted')}
            >
              <h2>
                Total Broadcasted: {!isLoggedIn && <i className="fas fa-lock" style={{ fontSize: '0.9rem' }}></i>}
                <span style={{ fontSize: '1.6rem', display: 'block', marginTop: '6px', color: '#34D399', fontWeight: 800 }}>
                  {isLoggedIn ? stats.totalBroadcasted : 0}
                </span>
              </h2>
            </div>

            <div
              className={`card dashboard-card-3 ${!isLoggedIn ? 'card-locked' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCardClick('unbroadcasted')}
            >
              <h2>
                Total Unbroadcasted: {!isLoggedIn && <i className="fas fa-lock" style={{ fontSize: '0.9rem' }}></i>}
                <span style={{ fontSize: '1.6rem', display: 'block', marginTop: '6px', color: '#F87171', fontWeight: 800 }}>
                  {isLoggedIn ? stats.totalUnbroadcasted : 0}
                </span>
              </h2>
            </div>

            <div
              className={`card dashboard-card-4 ${!isLoggedIn ? 'card-locked' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => handleCardClick('upcoming')}
            >
              <h2>
                Upcoming (3 Days): {!isLoggedIn && <i className="fas fa-lock" style={{ fontSize: '0.9rem' }}></i>}
                <span style={{ fontSize: '1.6rem', display: 'block', marginTop: '6px', color: '#60A5FA', fontWeight: 800 }}>
                  {isLoggedIn ? stats.upcoming : 0}
                </span>
              </h2>
            </div>
          </>
        )}
      </div>

      <LoginModal />
      <AddEventModal onSuccess={fetchDashboardData} />
      <BulkPasswordModal
        targetStatus={bulkStatus}
        onClose={() => setBulkStatus(null)}
        onConfirm={handleBulkConfirm}
      />
    </main>
  );
}
