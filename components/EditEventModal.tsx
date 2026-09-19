'use client';

import React, { useEffect, useState } from 'react';
import { EventItem, updateEventInDB } from '@/lib/supabaseClient';

interface EditEventModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
  onSuccess: (updated: EventItem) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  event,
  onClose,
  onSuccess,
}) => {
  const [eventName, setEventName] = useState('');
  const [eventMappingID, setEventMappingID] = useState('');
  const [venueName, setVenueName] = useState('');
  const [eventID, setEventID] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [listCost, setListCost] = useState('');
  const [eventStatus, setEventStatus] = useState('Unbroadcasted');
  const [eventURL, setEventURL] = useState('');
  const [eventImageURL, setEventImageURL] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setEventName(event.event_name || '');
      setEventMappingID(event.event_mapping_id || '');
      setVenueName(event.venue_name || '');
      setEventID(event.event_id || '');

      if (event.event_start_time) {
        const date = new Date(event.event_start_time);
        const localDate = new Date(
          date.getTime() - date.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16);
        setEventStartTime(localDate);
      } else {
        setEventStartTime('');
      }

      setTransferDate(
        event.transfer_date ? event.transfer_date.slice(0, 10) : ''
      );
      setListCost(event.list_cost_percentage?.toString() || '');
      setEventStatus(event.event_status || 'Unbroadcasted');
      setEventURL(event.event_url || '');
      setEventImageURL(event.event_image_url || '');
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const updates: Partial<EventItem> = {
      event_name: eventName.trim(),
      event_mapping_id: eventMappingID.trim(),
      venue_name: venueName.trim(),
      event_id: eventID.trim(),
      event_start_time: eventStartTime,
      transfer_date: transferDate,
      list_cost_percentage: Number(listCost),
      event_status: eventStatus,
      event_url: eventURL.trim(),
      event_image_url: eventImageURL.trim(),
    };

    try {
      const updated = await updateEventInDB(event.id, updates);
      alert('Event updated successfully.');
      onSuccess(updated);
      onClose();
    } catch (error: any) {
      alert('Could not save changes: ' + (error?.message || 'please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="editModal" className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Event</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="modal-subtitle">Update the event details below.</p>

        <form id="editForm" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Event Mapping ID *</label>
              <input
                type="text"
                value={eventMappingID}
                onChange={(e) => setEventMappingID(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Venue Name *</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Event ID *</label>
              <input
                type="text"
                value={eventID}
                onChange={(e) => setEventID(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Event Start Time *</label>
              <input
                type="datetime-local"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Transfer Date *</label>
              <input
                type="date"
                value={transferDate}
                onChange={(e) => setTransferDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>List Cost Percentage *</label>
              <input
                type="number"
                value={listCost}
                onChange={(e) => setListCost(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Event Status *</label>
              <select
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value)}
                required
              >
                <option value="Active">Active</option>
                <option value="Broadcasted">Broadcasted</option>
                <option value="Unbroadcasted">Unbroadcasted</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Event URL</label>
            <input
              type="url"
              value={eventURL}
              onChange={(e) => setEventURL(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group full-width">
            <label>Event Image URL</label>
            <input
              type="url"
              value={eventImageURL}
              onChange={(e) => setEventImageURL(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            className="submit-event-btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
