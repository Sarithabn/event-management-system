import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, bookingsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';
import { formatDate, formatTime, formatCurrency, getCategoryIcon, getStatusColor } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { success, error: notifError } = useNotif();
  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [attendees, setAttendees] = useState([{ name: '', email: '' }]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await eventsAPI.getOne(id);
        setEvent(data.event);
        setTickets(data.tickets);
      } catch { navigate('/events'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [id, navigate]);

  const handleSelectTicket = (ticket) => {
    if (!isAuthenticated) { navigate('/login', { state: { from: { pathname: `/events/${id}` } } }); return; }
    setSelectedTicket(ticket);
    setQuantity(1);
    setAttendees([{ name: user?.name || '', email: user?.email || '' }]);
    setBookingModal(true);
  };

  const handleQuantityChange = (q) => {
    setQuantity(q);
    const newAttendees = Array.from({ length: q }, (_, i) => attendees[i] || { name: '', email: '' });
    setAttendees(newAttendees);
  };

  const handleBook = async () => {
    setBookingLoading(true);
    try {
      const { data } = await bookingsAPI.create({ eventId: id, ticketId: selectedTicket._id, quantity, attendees });
      success('🎉 Booking confirmed!');
      setBookingModal(false);
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      notifError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <Spinner fullPage />;
  if (!event) return null;

  const isSoldOut = event.bookedCount >= event.totalCapacity;

  return (
    <div className="event-detail">
      <div className="event-detail-hero" style={event.coverImage ? { backgroundImage: `url(${event.coverImage})` } : {}}>
        <div className="event-detail-hero-overlay">
          <div className="event-detail-hero-content">
            <div className="event-detail-badges">
              <span className="badge badge-category">{getCategoryIcon(event.category)} {event.category}</span>
              <span className="badge" style={{ backgroundColor: getStatusColor(event.status) + '33', color: getStatusColor(event.status) }}>{event.status}</span>
              {event.isFeatured && <span className="badge badge-featured">⭐ Featured</span>}
            </div>
            <h1 className="event-detail-title">{event.title}</h1>
            <p className="event-detail-organizer">by {event.organizer?.name}</p>
          </div>
        </div>
      </div>

      <div className="event-detail-body">
        <div className="event-detail-main">
          <div className="event-detail-info-card">
            <div className="event-info-row"><span className="info-icon">📅</span><div><strong>Date</strong><p>{formatDate(event.startDate)} – {formatDate(event.endDate)}</p></div></div>
            <div className="event-info-row"><span className="info-icon">🕐</span><div><strong>Time</strong><p>{formatTime(event.startTime)} – {formatTime(event.endTime)}</p></div></div>
            <div className="event-info-row"><span className="info-icon">📍</span><div><strong>Venue</strong><p>{event.venue?.name}, {event.venue?.address}, {event.venue?.city}</p></div></div>
            <div className="event-info-row"><span className="info-icon">👥</span><div><strong>Capacity</strong><p>{event.totalCapacity - event.bookedCount} of {event.totalCapacity} available</p></div></div>
          </div>

          <div className="event-description">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>

          {event.tags?.length > 0 && (
            <div className="event-tags">
              {event.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
            </div>
          )}
        </div>

        <div className="event-detail-sidebar">
          <div className="tickets-panel">
            <h2 className="tickets-panel-title">Tickets</h2>
            {isSoldOut && <div className="sold-out-banner">🔴 Sold Out</div>}
            {tickets.length === 0 ? (
              <p className="no-tickets">No tickets available yet.</p>
            ) : (
              <div className="ticket-list">
                {tickets.map(ticket => {
                  const available = ticket.totalQuantity - ticket.soldQuantity;
                  const isOut = available <= 0;
                  return (
                    <div key={ticket._id} className={`ticket-item ${isOut ? 'ticket-sold-out' : ''}`}>
                      <div className="ticket-item-info">
                        <h3 className="ticket-name">{ticket.name}</h3>
                        {ticket.description && <p className="ticket-desc">{ticket.description}</p>}
                        <div className="ticket-meta">
                          <span className="ticket-price">{formatCurrency(ticket.price, ticket.currency)}</span>
                          <span className="ticket-avail">{isOut ? 'Sold out' : `${available} left`}</span>
                        </div>
                      </div>
                      <button
                        className={`btn ${isOut ? 'btn-disabled' : 'btn-primary'}`}
                        disabled={isOut || event.status !== 'published'}
                        onClick={() => handleSelectTicket(ticket)}
                      >
                        {isOut ? 'Sold Out' : 'Book'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {(user?.role === 'organizer' || user?.role === 'admin') && event.organizer?._id === user?._id || user?.role === 'admin' ? (
            <div className="organizer-actions">
              <button className="btn btn-outline btn-full" onClick={() => navigate(`/organizer/events/${id}/edit`)}>✏️ Edit Event</button>
              <button className="btn btn-outline btn-full" onClick={() => navigate(`/organizer/events/${id}/tickets`)}>🎫 Manage Tickets</button>
              <button className="btn btn-outline btn-full" onClick={() => navigate(`/organizer/events/${id}/bookings`)}>📋 View Bookings</button>
            </div>
          ) : null}
        </div>
      </div>

      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="Book Tickets" size="lg">
        {selectedTicket && (
          <div className="booking-modal">
            <div className="booking-ticket-summary">
              <h3>{selectedTicket.name}</h3>
              <p>{event.title}</p>
              <p>{formatDate(event.startDate)} at {formatTime(event.startTime)}</p>
            </div>

            <div className="form-group">
              <label>Number of Tickets</label>
              <select className="form-input" value={quantity} onChange={e => handleQuantityChange(Number(e.target.value))}>
                {Array.from({ length: Math.min(selectedTicket.maxPerBooking, selectedTicket.totalQuantity - selectedTicket.soldQuantity) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="attendees-form">
              <h4>Attendee Details</h4>
              {attendees.map((a, i) => (
                <div key={i} className="attendee-row">
                  <p className="attendee-num">Attendee {i + 1}</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Name</label>
                      <input className="form-input" value={a.name} onChange={e => { const arr = [...attendees]; arr[i].name = e.target.value; setAttendees(arr); }} required />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input className="form-input" type="email" value={a.email} onChange={e => { const arr = [...attendees]; arr[i].email = e.target.value; setAttendees(arr); }} required />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="booking-summary">
              <div className="summary-row">
                <span>{selectedTicket.name} × {quantity}</span>
                <span>{formatCurrency(selectedTicket.price * quantity, selectedTicket.currency)}</span>
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span className="total-price">{formatCurrency(selectedTicket.price * quantity, selectedTicket.currency)}</span>
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={handleBook} disabled={bookingLoading}>
              {bookingLoading ? 'Processing...' : `Confirm Booking — ${formatCurrency(selectedTicket.price * quantity, selectedTicket.currency)}`}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EventDetail;
