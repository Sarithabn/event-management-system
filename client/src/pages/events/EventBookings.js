import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI, eventsAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';

const EventBookings = () => {
  const { eventId } = useParams();
  const { error: notifError } = useNotif();
  const [bookings, setBookings] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [bookingsRes, eventRes] = await Promise.all([
          bookingsAPI.getByEvent(eventId),
          eventsAPI.getOne(eventId)
        ]);
        setBookings(bookingsRes.data.bookings);
        setEvent(eventRes.data.event);
      } catch { notifError('Failed to load'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [eventId]);

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.totalAmount, 0);
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const attended = bookings.filter(b => b.status === 'attended').length;

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <Link to="/organizer" className="back-link">← Back to Dashboard</Link>
            <h1>📋 Event Bookings</h1>
            <p>{event?.title}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="stat-card-icon">🎫</div><div><p className="stat-card-value">{bookings.length}</p><p className="stat-card-label">Total Bookings</p></div></div>
          <div className="stat-card"><div className="stat-card-icon">✅</div><div><p className="stat-card-value">{confirmed}</p><p className="stat-card-label">Confirmed</p></div></div>
          <div className="stat-card"><div className="stat-card-icon">🎉</div><div><p className="stat-card-value">{attended}</p><p className="stat-card-label">Attended</p></div></div>
          <div className="stat-card"><div className="stat-card-icon">💰</div><div><p className="stat-card-value">{formatCurrency(totalRevenue)}</p><p className="stat-card-label">Revenue</p></div></div>
        </div>

        <div className="dashboard-section">
          {loading ? <Spinner /> : bookings.length === 0 ? (
            <div className="empty-state small"><p>No bookings yet for this event.</p></div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr><th>Ref</th><th>Attendee</th><th>Ticket</th><th>Qty</th><th>Amount</th><th>Status</th><th>Checked In</th><th>Date</th></tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b._id}>
                      <td className="booking-ref-cell">{b.bookingRef}</td>
                      <td>
                        <div><strong>{b.user?.name}</strong></div>
                        <div style={{fontSize:'0.75rem',color:'var(--text-3)'}}>{b.user?.email}</div>
                      </td>
                      <td>{b.ticket?.name}</td>
                      <td>{b.quantity}</td>
                      <td>{formatCurrency(b.totalAmount)}</td>
                      <td><span style={{ color: getStatusColor(b.status) }}>● {b.status}</span></td>
                      <td>{b.checkedIn ? <span style={{color:'var(--success)'}}>✓ {formatDate(b.checkedInAt)}</span> : <span style={{color:'var(--text-3)'}}>—</span>}</td>
                      <td>{formatDate(b.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EventBookings;
