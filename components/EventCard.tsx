'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { EventItem } from '@/lib/supabaseClient';

interface EventCardProps {
  event: EventItem;
}

function getSafeUrl(value?: string | null): string {
  const url = String(value || '').trim();
  if (!url) return '';
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return '';
    }
    return parsedUrl.href;
  } catch {
    return '';
  }
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const router = useRouter();

  const fallbackImage =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmM8P5uvVCt-8ZlBmd2qmlJK-C7RpM07uW06KF_uMeKA&s=10';
  const imageUrl = event.event_image_url || fallbackImage;
  const safeEventUrl = getSafeUrl(event.event_url);

  const status = event.event_status || 'Unbroadcasted';
  const isBroadcasted = status === 'Broadcasted' || status === 'Active';

  const handleCardClick = () => {
    router.push(`/event-details/${encodeURIComponent(event.id)}`);
  };

  return (
    <div
      className="card"
      title={event.event_name || 'View event details'}
      aria-label={`View ${event.event_name || 'event'} details`}
      style={{
        backgroundImage: `url('${imageUrl.replace(/'/g, '%27')}')`,
        cursor: 'pointer',
      }}
      onClick={handleCardClick}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '1.4rem',
          background:
            'linear-gradient(to top, rgba(11, 19, 41, 0.98), rgba(11, 19, 41, 0.3) 75%, transparent)',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '100%',
            color: '#ffffff',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          <div
            style={{
              fontSize: '1.15rem',
              fontWeight: 800,
              marginBottom: '0.4rem',
              lineHeight: 1.3,
            }}
          >
            {event.event_name || 'N/A'}
          </div>

          <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.9 }}>
            <strong style={{ color: '#82b4ff' }}>Venue:</strong> {event.venue_name || 'N/A'}
          </div>

          <div style={{ fontSize: '0.85rem', marginTop: '0.2rem', opacity: 0.9 }}>
            <strong style={{ color: '#82b4ff' }}>Mapping ID:</strong> {event.event_mapping_id || 'N/A'}
          </div>

          <div style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>
            <strong style={{ color: '#82b4ff' }}>Link:</strong>{' '}
            {safeEventUrl ? (
              <a
                href={safeEventUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#60A5FA',
                  textDecoration: 'underline',
                  pointerEvents: 'auto',
                  wordBreak: 'break-all',
                  fontWeight: 600,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                Open Event
              </a>
            ) : (
              'N/A'
            )}
          </div>

          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 700,
              marginTop: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              color: isBroadcasted ? '#34D399' : '#F87171',
            }}
          >
            <span className={`pulse-dot ${isBroadcasted ? 'active' : 'inactive'}`}></span>
            {status}
          </div>
        </div>
      </div>
    </div>
  );
};
