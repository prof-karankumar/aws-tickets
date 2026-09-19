'use client';

import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LoginModal } from '@/components/LoginModal';
import { AddEventModal } from '@/components/AddEventModal';
import { BulkPasswordModal } from '@/components/BulkPasswordModal';
import { EventCard } from '@/components/EventCard';
import { useToast } from '@/context/ToastContext';
import { getAllEventsFromDB, updateAllEventsStatusInDB, EventItem } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

function TotalEventsContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') || '';
  const { showToast } = useToast();
  const { isLoggedIn, openLoginModal } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'Broadcasted' | 'Unbroadcasted' | null>(null);

  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Lock this page behind login — anyone landing here directly gets the login prompt.
  useEffect(() => {
    if (!isLoggedIn) openLoginModal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const titles: Record<string, string> = {
    all: 'TOTAL EVENTS',
    broadcasted: 'BROADCASTED EVENTS',
    unbroadcasted: 'UNBROADCASTED EVENTS',
    upcoming: 'UPCOMING EVENTS (3 Days)',
  };

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllEventsFromDB();

      data.sort((a, b) => {
        const dateA = new Date(a.event_start_time || 0).getTime();
        const dateB = new Date(b.event_start_time || 0).getTime();
        return dateB - dateA;
      });

      setAllEvents(data);
    } catch (error: any) {
      showToast(`Could not load events: ${error?.message || 'please try again.'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents();
    } else {
      setLoading(false);
      setAllEvents([]);
    }
  }, [isLoggedIn, fetchEvents]);

  // Instant zero-latency memoized filtering
  const filteredEvents = useMemo(() => {
    let events = [...allEvents];

    if (filterParam === 'broadcasted') {
      events = events.filter((e) => e.event_status === 'Broadcasted');
    } else if (filterParam === 'unbroadcasted') {
      events = events.filter((e) => e.event_status === 'Unbroadcasted');
    } else if (filterParam === 'upcoming') {
      const now = new Date();
      const threeDaysLater = new Date();
      threeDaysLater.setDate(now.getDate() + 3);
      events = events.filter((e) => {
        if (!e.event_start_time) return false;
        const eventDate = new Date(e.event_start_time);
        return eventDate >= now && eventDate <= threeDaysLater;
      });
    }

    const term = searchTerm.trim().toLowerCase();
    if (!term) return events;

    return events.filter((eventData) => {
      const searchableText = [
        eventData.event_name,
        eventData.event_mapping_id,
        eventData.event_url,
        eventData.venue_name,
      ]
        .map((val) => String(val || '').toLowerCase())
        .join(' ');

      return searchableText.includes(term);
    });
  }, [allEvents, filterParam, searchTerm]);

  const handleBulkConfirm = async (status: 'Broadcasted' | 'Unbroadcasted') => {
    setBulkStatus(null);
    showToast(
      `Updating all events to ${status === 'Broadcasted' ? 'Broadcasted' : 'Unbroadcasted'}...`,
      status === 'Broadcasted' ? 'broadcast-success' : 'unbroadcast-success'
    );

    // Optimistic UI state update
    setAllEvents((prev) =>
      prev.map((e) => ({ ...e, event_status: status }))
    );

    try {
      await updateAllEventsStatusInDB(status);
      showToast(
        `Successfully ${status === 'Broadcasted' ? 'broadcasted' : 'unbroadcasted'} all events.`,
        status === 'Broadcasted' ? 'broadcast-success' : 'unbroadcast-success'
      );
    } catch (error: any) {
      showToast(`Could not update events: ${error?.message || 'please try again.'}`, 'error');
      fetchEvents();
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

      <div className="dashboard-title">
        <div>
          <h1>
            <span style={{ fontSize: '3.2rem', marginTop: '0.8rem', display: 'block' }}>
              {titles[filterParam] || 'TOTAL EVENTS'}
            </span>
          </h1>
          <p style={{ color: 'var(--subtext-color)', fontSize: '1.25rem', marginTop: '0.8rem' }}>
            Click on any event to view full information
          </p>
        </div>
      </div>

      <div className="controls">
        <div className="search-wrapper">
          <i className="fas fa-search search-icon"></i>
          <input
            type="text"
            id="searchInput"
            placeholder="Search concerts, sports, arts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button id="searchBtn" type="button" onClick={() => {}}>
          <i className="fas fa-search"></i>
          Search
        </button>
      </div>

      <div className="container" id="eventsGrid">
        {loading ? (
          <>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </>
        ) : filteredEvents.length === 0 ? (
          <div className="card" style={{ gridColumn: 'span 4', textAlign: 'center' }}>
            <h2>No events found matching search criteria.</h2>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        )}
      </div>

      <LoginModal />
      <AddEventModal onSuccess={fetchEvents} />
      <BulkPasswordModal
        targetStatus={bulkStatus}
        onClose={() => setBulkStatus(null)}
        onConfirm={handleBulkConfirm}
      />
    </main>
  );
}

export default function TotalEventsPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: '#fff' }}>Loading portal...</div>}>
      <TotalEventsContent />
    </Suspense>
  );
}
