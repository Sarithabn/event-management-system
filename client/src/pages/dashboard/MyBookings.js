import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import BookingCard from '../../components/booking/BookingCard';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';

const MyBookings = () => {
  const { success, error: notifError } = useNotif();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancelId, setCancelId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingsAPI.getMy();
      setBookings(data.bookings);
    } catch { notifError('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await bookingsAPI.cancel(cancelId, { reason: cancelReason });
      success('Booking cancelled');
      setCancelId(null);
      setCancelReason('');
      fetchBookings();
    } catch (err) { notifError(err.response?.data?.message || 'Cancel failed'); }
    finally { setCancelling(false); }
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div><h1>🎫 My Bookings</h1><p>All your event bookings in one place</p></div>
        </div>

        <div className="booking-filters">
          {['all', 'confirmed', 'attended', 'cancelled'].map(f => (
            <button key={f} className={`filter-chip ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">
                {f === 'all' ? bookings.length : bookings.filter(b => b.status === f).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎫</p>
            <h3>No {filter !== 'all' ? filter : ''} bookings found</h3>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => (
              <BookingCard key={b._id} booking={b} onCancel={(id) => setCancelId(id)} />
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!cancelId} onClose={() => setCancelId(null)} title="Cancel Booking">
        <div className="cancel-modal">
          <p>Are you sure you want to cancel this booking?</p>
          <div className="form-group">
            <label>Reason (optional)</label>
            <textarea className="form-input form-textarea" rows={3} value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Why are you cancelling?" />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setCancelId(null)}>Keep Booking</button>
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Yes, Cancel'}</button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default MyBookings;
