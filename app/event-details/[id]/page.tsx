'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { LoginModal } from '@/components/LoginModal';
import { AddEventModal } from '@/components/AddEventModal';
import { EditEventModal } from '@/components/EditEventModal';
import { BulkPasswordModal } from '@/components/BulkPasswordModal';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import {
  getEventByIdFromDB,
  updateEventInDB,
  deleteEventFromDB,
  updateAllEventsStatusInDB,
  EventItem,
} from '@/lib/supabaseClient';

function formatDate(value?: string | null, includeTime = false) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString([], includeTime
    ? { dateStyle: 'medium', timeStyle: 'short' }
    : { dateStyle: 'medium' }
  );
}

export default function EventDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { showToast } = useToast();
  const { isLoggedIn, openLoginModal } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<'Broadcasted' | 'Unbroadcasted' | null>(null);

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadEvent = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getEventByIdFromDB(id);
      if (!data) {
        setErrorMsg('Event not found.');
      } else {
        setEvent(data);
      }
    } catch (error: any) {
      setErrorMsg(`Could not load event details: ${error?.message || 'please try again.'}`);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (isLoggedIn) {
      loadEvent();
    } else {
      setLoading(false);
      openLoginModal();
    }
  }, [isLoggedIn, loadEvent, openLoginModal]);

  // Instant zero-latency Optimistic Status Toggle
  const handleUpdateStatus = async (newStatus: string) => {
    if (!event) return;

    const previousStatus = event.event_status;
    // Optimistically update state immediately
    setEvent((prev) => (prev ? { ...prev, event_status: newStatus } : null));

    showToast(
      `Successfully ${newStatus === 'Broadcasted' ? 'broadcasted' : 'unbroadcasted'} event.`,
      newStatus === 'Broadcasted' ? 'broadcast-success' : 'unbroadcast-success'
    );

    try {
      const updated = await updateEventInDB(event.id, { event_status: newStatus });
      setEvent(updated);
    } catch (error: any) {
      // Revert if request failed
      setEvent((prev) => (prev ? { ...prev, event_status: previousStatus } : null));
      showToast(`Could not update the event: ${error?.message || 'please try again.'}`, 'error');
    }
  };

  const handleDeleteEvent = async () => {
    if (!event) return;
    const confirmed = confirm('Are you sure you want to delete this event? This cannot be undone.');
    if (!confirmed) return;

    try {
      await deleteEventFromDB(event.id);
      showToast('Event deleted successfully.', 'success');
      router.push('/total-events');
    } catch (error: any) {
      alert(`Could not delete the event: ${error?.message || 'please try again.'}`);
    }
  };

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
      loadEvent();
    } catch (error: any) {
      showToast(`Could not update events: ${error?.message || 'please try again.'}`, 'error');
    }
  };

  const fallbackImage =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmM8P5uvVCt-8ZlBmd2qmlJK-C7RpM07uW06KF_uMeKA&s=10';
  const imageUrl = event?.event_image_url || fallbackImage;
  const isBroadcasted = event?.event_status === 'Broadcasted' || event?.event_status === 'Active';

  return (
    <main>
      <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenBulkPasswordModal={(status) => setBulkStatus(status)}
      />

      <div className="event-detail-container">
        <Link href="/total-events" className="back-link">
          <i className="fas fa-arrow-left"></i> Back to All Events
        </Link>

        {loading ? (
          <div className="event-info-card">
            <p style={{ color: 'var(--subtext-color)' }}>Loading event details...</p>
          </div>
        ) : errorMsg || !event ? (
          <div className="event-info-card">
            <p style={{ color: 'var(--subtext-color)' }}>
              {errorMsg || 'Event not found.'}{' '}
              <Link href="/total-events" style={{ color: '#60A5FA' }}>
                Go back
              </Link>
            </p>
          </div>
        ) : (
          <div id="eventContent">
            <div
              className="event-hero"
              style={{ backgroundImage: `url('${imageUrl.replace(/'/g, '%27')}')` }}
            >
              <div className="event-hero-content">
                <h1>{event.event_name || 'Unknown Event'}</h1>
              </div>
            </div>

            <div className="event-info-card">
              <h3>
                <i className="fas fa-info-circle"></i> Event Information
              </h3>

              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Event Name</span>
                  <span className="value">{event.event_name || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <span className="label">Venue</span>
                  <span className="value">{event.venue_name || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <span className="label">Mapping ID</span>
                  <span className="value">{event.event_mapping_id || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <span className="label">Event Link</span>
                  {event.event_url ? (
                    <a
                      href={event.event_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#60A5FA', wordBreak: 'break-all', fontWeight: 600 }}
                    >
                      Open Event Link
                    </a>
                  ) : (
                    <span className="value">N/A</span>
                  )}
                </div>

                <div className="info-item">
                  <span className="label">Event ID</span>
                  <span className="value">{event.event_id || 'N/A'}</span>
                </div>

                <div className="info-item">
                  <span className="label">Event Date & Time</span>
                  <span className="value">{formatDate(event.event_start_time, true)}</span>
                </div>

                <div className="info-item">
                  <span className="label">Transfer Date</span>
                  <span className="value">{formatDate(event.transfer_date)}</span>
                </div>

                <div className="info-item">
                  <span className="label">List Cost %</span>
                  <span className="value">{event.list_cost_percentage ?? 0}%</span>
                </div>

                <div className="info-item">
                  <span className="label">Status</span>
                  <span
                    className="value"
                    style={{
                      color: isBroadcasted ? '#34D399' : '#F87171',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span className={`pulse-dot ${isBroadcasted ? 'active' : 'inactive'}`}></span>
                    {event.event_status || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="event-info-card">
              <h3>
                <i className="fas fa-cog"></i> Event Actions
              </h3>

              <div className="action-buttons">
                <button
                  className="action-btn broadcast-btn"
                  onClick={() => handleUpdateStatus('Broadcasted')}
                >
                  <i className="fas fa-broadcast-tower"></i> Broadcast
                </button>

                <button
                  className="action-btn stop-btn"
                  onClick={() => handleUpdateStatus('Unbroadcasted')}
                >
                  <i className="fas fa-stop"></i> Stop Broadcast
                </button>

                <button
                  className="action-btn edit-btn"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <i className="fas fa-edit"></i> Edit
                </button>

                <button
                  className="action-btn delete-btn"
                  onClick={handleDeleteEvent}
                >
                  <i className="fas fa-trash"></i> Delete Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <LoginModal />
      <AddEventModal onSuccess={loadEvent} />
      <EditEventModal
        isOpen={isEditModalOpen}
        event={event}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => setEvent(updated)}
      />
      <BulkPasswordModal
        targetStatus={bulkStatus}
        onClose={() => setBulkStatus(null)}
        onConfirm={handleBulkConfirm}
      />
    </main>
  );
}
