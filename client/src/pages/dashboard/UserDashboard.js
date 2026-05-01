import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';
import BookingCard from '../../components/booking/BookingCard';
import Spinner from '../../components/common/Spinner';
import DashboardLayout from '../../components/layout/DashboardLayout';

const UserDashboard = () => {
  const { user } = useAuth();
  const { success, error: notifError } = useNotif();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await bookingsAPI.getMy();
        setBookings(data.bookings);
      } catch (err) {
        notifError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };
    fetch();
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

  const upcoming = bookings.filter(b => b.status === 'confirmed' && new Date(b.event?.startDate) > new Date());
  const past = bookings.filter(b => b.status !== 'confirmed' || new Date(b.event?.startDate) <= new Date());

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-page-header">
          <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <Link to="/events" className="btn btn-primary">Browse Events</Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <h3>{bookings.length}</h3>
              <p>Total Bookings</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{upcoming.length}</h3>
              <p>Upcoming Events</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{bookings.filter(b => b.status === 'attended').length}</h3>
              <p>Events Attended</p>
            </div>
          </div>
        </div>

        {loading ? <Spinner /> : (
          <>
            {upcoming.length > 0 && (
              <section className="dashboard-section">
                <h2>Upcoming Events</h2>
                <div className="bookings-list">
                  {upcoming.map(b => <BookingCard key={b._id} booking={b} onCancel={handleCancel} />)}
                </div>
              </section>
            )}
            {past.length > 0 && (
              <section className="dashboard-section">
                <h2>Past & Cancelled</h2>
                <div className="bookings-list">
                  {past.map(b => <BookingCard key={b._id} booking={b} onCancel={handleCancel} />)}
                </div>
              </section>
            )}
            {bookings.length === 0 && (
              <div className="dashboard-empty">
                <div className="empty-icon">🎟️</div>
                <h3>No bookings yet</h3>
                <p>Explore events and book your first ticket!</p>
                <Link to="/events" className="btn btn-primary">Browse Events</Link>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
