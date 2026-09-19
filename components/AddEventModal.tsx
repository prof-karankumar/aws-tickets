'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { addEventToDB, NewEventInput } from '@/lib/supabaseClient';

interface AddEventModalProps {
  onSuccess?: () => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({ onSuccess }) => {
  const { isAddEventModalOpen, closeAddEventModal, isLoggedIn } = useAuth();
  const { showToast } = useToast();

  const [eventName, setEventName] = useState('');
  const [eventMappingID, setEventMappingID] = useState('');
  const [venueName, setVenueName] = useState('');
  const [eventID, setEventID] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [transferDate, setTransferDate] = useState('');
  const [listCost, setListCost] = useState('');
  const [eventStatus, setEventStatus] = useState('');
  const [eventURL, setEventURL] = useState('');
  const [eventImageURL, setEventImageURL] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAddEventModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      alert("Please login first.");
      return;
    }

    setLoading(true);

    const newEventData: NewEventInput = {
      event_name: eventName,
      event_mapping_id: eventMappingID,
      venue_name: venueName,
      event_id: eventID,
      event_start_time: eventStartTime,
      transfer_date: transferDate,
      list_cost_percentage: parseFloat(listCost),
      event_status: eventStatus,
      event_url: eventURL,
      event_image_url: eventImageURL,
    };

    try {
      await addEventToDB(newEventData);
      showToast('Success! Event "' + eventName + '" has been added and saved.', 'success');
      
      setEventName('');
      setEventMappingID('');
      setVenueName('');
      setEventID('');
      setEventStartTime('');
      setTransferDate('');
      setListCost('');
      setEventStatus('');
      setEventURL('');
      setEventImageURL('');

      closeAddEventModal();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      alert('Could not save the event: ' + (error?.message || 'please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="eventModal" className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Add New Event</h2>
          <button className="close-btn" onClick={closeAddEventModal}>
            ✕
          </button>
        </div>

        <p className="modal-subtitle">
          Fill in the details below to add a new event to the system.
        </p>

        <form id="eventForm" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Event Name *</label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Enter event name"
                required
              />
            </div>

            <div className="form-group">
              <label>Event Mapping ID *</label>
              <input
                type="text"
                value={eventMappingID}
                onChange={(e) => setEventMappingID(e.target.value)}
                placeholder="Enter event mapping ID"
                required
              />
            </div>

            <div className="form-group">
              <label>Venue Name *</label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Enter venue name"
                required
              />
            </div>

            <div className="form-group">
              <label>Event ID *</label>
              <input
                type="text"
                value={eventID}
                onChange={(e) => setEventID(e.target.value)}
                placeholder="Enter event ID"
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
                placeholder="Enter list cost %"
                required
              />
            </div>

            <div className="form-group">
              <label>Event Status *</label>
              <select
                className={`event-status-select ${eventStatus ? `status-${eventStatus.toLowerCase()}` : 'status-placeholder'}`}
                value={eventStatus}
                onChange={(e) => setEventStatus(e.target.value)}
                required
              >
                <option value="">Select status</option>
                <option value="Active">Active</option>
                <option value="Broadcasted">Broadcasted</option>
                <option value="Unbroadcasted">Unbroadcasted</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Event URL *</label>
            <input
              type="url"
              value={eventURL}
              onChange={(e) => setEventURL(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Event Image URL *</label>
            <input
              type="url"
              value={eventImageURL}
              onChange={(e) => setEventImageURL(e.target.value)}
              placeholder="https://..."
              required
            />
          </div>

          <button
            type="submit"
            className="submit-event-btn"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Event'}
          </button>
        </form>
      </div>
    </div>
  );
};
