import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { formatDate, formatTime, formatCurrency, getStatusColor } from '../../utils/helpers';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';

const BookingDetail = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getOne(id).then(({ data }) => { setBooking(data.booking); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout><Spinner fullPage /></DashboardLayout>;
  if (!booking) return <DashboardLayout><div className="empty-state"><h3>Booking not found</h3></div></DashboardLayout>;

  const { event, ticket, status, quantity, totalAmount, currency, bookingRef, attendees, qrCode, checkedIn, checkedInAt, createdAt } = booking;

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <Link to="/bookings" className="back-link">← Back to Bookings</Link>
            <h1>Booking Details</h1>
          </div>
          <span className="status-badge-lg" style={{ color: getStatusColor(status), border: `2px solid ${getStatusColor(status)}`, backgroundColor: getStatusColor(status) + '11' }}>
            {status?.toUpperCase()}
          </span>
        </div>

        <div className="booking-detail-layout">
          <div className="booking-detail-left">
            <div className="booking-info-card">
              <h2>Event Information</h2>
              {event?.coverImage && <img src={event.coverImage} alt={event.title} className="booking-event-cover" />}
              <h3 className="booking-event-title">{event?.title}</h3>
              <div className="booking-info-rows">
                <div className="booking-info-row"><span>📅 Date</span><strong>{formatDate(event?.startDate)}</strong></div>
                <div className="booking-info-row"><span>🕐 Time</span><strong>{formatTime(event?.startTime)}</strong></div>
                <div className="booking-info-row"><span>📍 Venue</span><strong>{event?.venue?.name}, {event?.venue?.city}</strong></div>
                <div className="booking-info-row"><span>🎫 Ticket</span><strong>{ticket?.name}</strong></div>
                <div className="booking-info-row"><span>🔢 Quantity</span><strong>{quantity}</strong></div>
                <div className="booking-info-row"><span>💰 Total</span><strong className="booking-price">{formatCurrency(totalAmount, currency)}</strong></div>
              </div>
            </div>

            <div className="booking-info-card">
              <h2>Booking Reference</h2>
              <div className="booking-ref-display">{bookingRef}</div>
              <p className="booking-date">Booked on {formatDate(createdAt)}</p>
              {checkedIn && <div className="checked-in-banner">✅ Checked In — {formatDate(checkedInAt)}</div>}
            </div>

            {attendees?.length > 0 && (
              <div className="booking-info-card">
                <h2>Attendees</h2>
                {attendees.map((a, i) => (
                  <div key={i} className="attendee-info">
                    <span className="attendee-num">{i + 1}</span>
                    <div>
                      <p className="attendee-name">{a.name}</p>
                      <p className="attendee-email">{a.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="booking-detail-right">
            {qrCode && (
              <div className="qr-ticket-card">
                <h2>Your E-Ticket</h2>
                <p>Show this QR code at the event entrance</p>
                <div className="qr-code-display">
                  <img src={qrCode} alt="QR Code" className="qr-code-img" />
                </div>
                <div className="qr-ref">{bookingRef}</div>
                <p className="qr-hint">📱 Screenshot this for offline access</p>
                {status !== 'cancelled' && (
                  <a href={qrCode} download={`ticket-${bookingRef}.png`} className="btn btn-outline btn-full">
                    ⬇️ Download QR Code
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BookingDetail;
