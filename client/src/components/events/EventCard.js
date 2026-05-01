import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, truncate, getCategoryIcon, getDaysUntil } from '../../utils/helpers';

const EventCard = ({ event }) => {
  const daysUntil = getDaysUntil(event.startDate);
  const isSoon = daysUntil > 0 && daysUntil <= 7;
  const isPast = daysUntil < 0;

  return (
    <Link to={`/events/${event._id}`} className="event-card">
      <div className="event-card-image">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} />
        ) : (
          <div className="event-card-placeholder">
            <span className="event-card-icon">{getCategoryIcon(event.category)}</span>
          </div>
        )}
        <div className="event-card-badges">
          <span className={`badge badge-category`}>{event.category}</span>
          {event.isFeatured && <span className="badge badge-featured">⭐ Featured</span>}
          {isSoon && <span className="badge badge-soon">Soon</span>}
          {isPast && <span className="badge badge-past">Past</span>}
        </div>
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <p className="event-card-desc">{truncate(event.description, 90)}</p>
        <div className="event-card-meta">
          <div className="event-meta-item">
            <span className="meta-icon">📅</span>
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon">🕐</span>
            <span>{formatTime(event.startTime)}</span>
          </div>
          <div className="event-meta-item">
            <span className="meta-icon">📍</span>
            <span>{event.venue?.city}, {event.venue?.country}</span>
          </div>
        </div>
        <div className="event-card-footer">
          <div className="event-capacity">
            <div className="capacity-bar">
              <div
                className="capacity-fill"
                style={{ width: `${Math.min((event.bookedCount / event.totalCapacity) * 100, 100)}%` }}
              />
            </div>
            <span className="capacity-text">
              {event.totalCapacity - event.bookedCount} seats left
            </span>
          </div>
          <span className="event-card-cta">View →</span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
