import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import { formatDate, formatTime, formatCurrency, getStatusColor, formatDateTime } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';

const BookingDetail = () => {
  const { id } = useParams();
  const { success, error: notifError } = useNotif();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    bookingsAPI.getOne(id).then(({ data }) => setBooking(data.booking)).catch(() => { notifError('Booking not found'); navigate('/bookings'); }).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await bookingsAPI.cancel(id, { reason: 'User cancelled' });
      setBooking(prev => ({ ...prev, status: 'cancelled' }));
      success('Booking cancelled');
    } catch (err) {
      notifError(err.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <Spinner fullPage />;
  if (!booking) return null;

  const { event, ticket } = booking;

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: 800, margin: '40px auto' }}>
        <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>← Back</button>
        <div className="booking-detail-card">
          <div className="booking-detail-header">
            <div>
              <h1>Booking Confirmation</h1>
              <code className="booking-ref-large">{booking.bookingRef}</code>
            </div>
            <div className="booking-status-large" style={{ background: getStatusColor(booking.status) + '22', color: getStatusColor(booking.status), border: `2px solid ${getStatusColor(booking.status)}` }}>
              {booking.status.toUpperCase()}
              {booking.checkedIn && <p style={{ fontSize: 12, marginTop: 4 }}>✓ Checked In {formatDateTime(booking.checkedInAt)}</p>}
            </div>
          </div>

          <div className="booking-detail-event">
            {event?.coverImage && <img src={event.coverImage} alt={event?.title} className="booking-event-cover" />}
            <div>
              <h2>{event?.title}</h2>
              <p>📅 {formatDate(event?.startDate)} at {formatTime(event?.startTime)}</p>
              <p>📍 {event?.venue?.name}, {event?.venue?.city}</p>
            </div>
          </div>

          <div className="booking-info-grid">
            <div className="booking-info-section">
              <h3>Ticket Details</h3>
              <div className="info-rows">
                <div className="info-row"><label>Type</label><span>{ticket?.name}</span></div>
                <div className="info-row"><label>Quantity</label><span>{booking.quantity}</span></div>
                <div className="info-row"><label>Unit Price</label><span>{formatCurrency(booking.unitPrice, booking.currency)}</span></div>
                <div className="info-row"><label>Total</label><strong>{formatCurrency(booking.totalAmount, booking.currency)}</strong></div>
                <div className="info-row"><label>Payment</label><span>{booking.paymentMethod}</span></div>
              </div>
            </div>

            <div className="booking-info-section">
              <h3>Attendees</h3>
              <div className="attendees-list">
                {booking.attendees?.map((a, i) => (
                  <div key={i} className="attendee-item">
                    <span className="attendee-num">{i + 1}</span>
                    <div><strong>{a.name}</strong><p>{a.email}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {booking.qrCode && booking.status !== 'cancelled' && (
            <div className="booking-qr-section">
              <h3>Entry QR Code</h3>
              <p className="text-muted">Show this at the event entrance</p>
              <img src={booking.qrCode} alt="QR Code" className="booking-qr-image" />
              <p className="qr-ref-label">{booking.bookingRef}</p>
            </div>
          )}

          {booking.status === 'cancelled' && (
            <div className="booking-cancelled-notice">
              <p>⚠️ This booking was cancelled on {formatDate(booking.cancelledAt)}</p>
              {booking.cancelReason && <p>Reason: {booking.cancelReason}</p>}
            </div>
          )}

          {booking.status === 'confirmed' && (
            <div className="booking-detail-actions">
              <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Cancel Booking'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
