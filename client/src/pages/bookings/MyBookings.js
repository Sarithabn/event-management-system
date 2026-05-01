import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import BookingCard from '../../components/booking/BookingCard';
import Spinner from '../../components/common/Spinner';

const MyBookings = () => {
  const { success, error: notifError } = useNotif();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    bookingsAPI.getMy().then(({ data }) => setBookings(data.bookings)).catch(() => notifError('Failed to load bookings')).finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await bookingsAPI.cancel(id, { reason: 'User cancelled' });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
      success('Booking cancelled');
    } catch (err) {
      notifError(err.response?.data?.message || 'Cancel failed');
    }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: 900, margin: '40px auto' }}>
        <div className="page-header">
          <h1>My Bookings</h1>
          <div className="filter-tabs">
            {['all', 'confirmed', 'attended', 'cancelled'].map(f => (
              <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="events-empty">
            <div className="empty-icon">🎟️</div>
            <h3>No bookings found</h3>
            <p>{filter !== 'all' ? 'Try a different filter' : 'Start exploring events!'}</p>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => <BookingCard key={b._id} booking={b} onCancel={handleCancel} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
