import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, formatCurrency, getStatusColor } from '../../utils/helpers';

const BookingCard = ({ booking, onCancel }) => {
  const { event, ticket, status, quantity, totalAmount, currency, bookingRef, createdAt, checkedIn } = booking;

  return (
    <div className="booking-card">
      <div className="booking-card-header">
        <div className="booking-event-info">
          {event?.coverImage && <img src={event.coverImage} alt={event?.title} className="booking-event-thumb" />}
          <div>
            <h3 className="booking-event-name">{event?.title || 'Event'}</h3>
            <p className="booking-event-date">
              📅 {formatDate(event?.startDate)} at {formatTime(event?.startTime)}
            </p>
            <p className="booking-event-venue">📍 {event?.venue?.city}</p>
          </div>
        </div>
        <div className="booking-status-badge" style={{ backgroundColor: getStatusColor(status) + '22', color: getStatusColor(status), border: `1px solid ${getStatusColor(status)}` }}>
          {status?.toUpperCase()}
          {checkedIn && <span className="checkin-badge"> ✓ Checked In</span>}
        </div>
      </div>

      <div className="booking-card-body">
        <div className="booking-detail-grid">
          <div className="booking-detail">
            <span className="detail-label">Booking Ref</span>
            <span className="detail-value booking-ref">{bookingRef}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Ticket Type</span>
            <span className="detail-value">{ticket?.name}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Quantity</span>
            <span className="detail-value">{quantity}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Total</span>
            <span className="detail-value booking-total">{formatCurrency(totalAmount, currency)}</span>
          </div>
          <div className="booking-detail">
            <span className="detail-label">Booked On</span>
            <span className="detail-value">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="booking-card-footer">
        <Link to={`/bookings/${booking._id}`} className="btn btn-outline btn-sm">View Details</Link>
        {status === 'confirmed' && (
          <button className="btn btn-danger btn-sm" onClick={() => onCancel(booking._id)}>Cancel Booking</button>
        )}
      </div>
    </div>
  );
};

export default BookingCard;
