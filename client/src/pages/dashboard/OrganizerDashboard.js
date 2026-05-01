import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { eventsAPI, ticketsAPI, bookingsAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import EventForm from '../../components/events/EventForm';
import TicketForm from '../../components/tickets/TicketForm';
import Modal from '../../components/common/Modal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import QRScanner from '../../components/qr/QRScanner';

// Overview sub-page
const OrgOverview = () => {
  const { error: notifError, success } = useNotif();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI.getMyEvents().then(({ data }) => setEvents(data.events)).catch(() => notifError('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventsAPI.delete(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      success('Event deleted');
    } catch (err) {
      notifError(err.response?.data?.message || 'Delete failed');
    }
  };

  const totalRevenue = events.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const totalBookings = events.reduce((sum, e) => sum + (e.bookingsCount || 0), 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Organizer Dashboard</h1>
        <Link to="/organizer/events/new" className="btn btn-primary">+ Create Event</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">🗓️</div><div className="stat-info"><h3>{events.length}</h3><p>Total Events</p></div></div>
        <div className="stat-card"><div className="stat-icon">🎫</div><div className="stat-info"><h3>{totalBookings}</h3><p>Total Bookings</p></div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-info"><h3>{formatCurrency(totalRevenue)}</h3><p>Total Revenue</p></div></div>
        <div className="stat-card"><div className="stat-icon">📢</div><div className="stat-info"><h3>{events.filter(e => e.status === 'published').length}</h3><p>Published</p></div></div>
      </div>

      {loading ? <Spinner /> : (
        <section className="dashboard-section">
          <h2>My Events</h2>
          {events.length === 0 ? (
            <div className="dashboard-empty">
              <div className="empty-icon">🗓️</div>
              <h3>No events yet</h3>
              <Link to="/organizer/events/new" className="btn btn-primary">Create Your First Event</Link>
            </div>
          ) : (
            <div className="organizer-events-table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Event</th><th>Date</th><th>Status</th><th>Bookings</th><th>Revenue</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev._id}>
                      <td><strong>{ev.title}</strong><br /><small>{ev.venue?.city}</small></td>
                      <td>{formatDate(ev.startDate)}</td>
                      <td><span className="status-pill" style={{ background: getStatusColor(ev.status) + '22', color: getStatusColor(ev.status) }}>{ev.status}</span></td>
                      <td>{ev.bookingsCount || 0}</td>
                      <td>{formatCurrency(ev.revenue || 0)}</td>
                      <td>
                        <div className="table-actions">
                          <Link to={`/events/${ev._id}`} className="btn btn-ghost btn-xs">View</Link>
                          <Link to={`/organizer/events/${ev._id}/edit`} className="btn btn-outline btn-xs">Edit</Link>
                          <Link to={`/organizer/events/${ev._id}/tickets`} className="btn btn-outline btn-xs">Tickets</Link>
                          <Link to={`/organizer/events/${ev._id}/bookings`} className="btn btn-ghost btn-xs">Bookings</Link>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(ev._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

// Create Event
const CreateEvent = () => {
  const { success, error: notifError } = useNotif();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await eventsAPI.create(data);
      success('Event created!');
      navigate(`/organizer/events/${res.event._id}/tickets`);
    } catch (err) {
      notifError(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Create New Event</h1>
        <Link to="/organizer" className="btn btn-ghost">← Back</Link>
      </div>
      <div className="form-card">
        <EventForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

// Edit Event
const EditEvent = () => {
  const { id } = require('react-router-dom').useParams();
  const { success, error: notifError } = useNotif();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    eventsAPI.getOne(id).then(({ data }) => setEvent(data.event)).catch(() => notifError('Event not found'));
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await eventsAPI.update(id, data);
      success('Event updated!');
      navigate('/organizer');
    } catch (err) {
      notifError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <Spinner />;
  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Edit Event</h1>
        <Link to="/organizer" className="btn btn-ghost">← Back</Link>
      </div>
      <div className="form-card">
        <EventForm initial={event} onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
};

// Manage Tickets
const ManageTickets = () => {
  const { id } = require('react-router-dom').useParams();
  const { success, error: notifError } = useNotif();
  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editTicket, setEditTicket] = useState(null);

  useEffect(() => {
    eventsAPI.getOne(id).then(({ data }) => { setEvent(data.event); setTickets(data.tickets); });
  }, [id]);

  const handleCreate = async (data) => {
    setLoading(true);
    try {
      const { data: res } = await ticketsAPI.create(data);
      setTickets(prev => [...prev, res.ticket]);
      success('Ticket created!');
      setShowForm(false);
    } catch (err) {
      notifError(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (tid) => {
    if (!window.confirm('Delete this ticket type?')) return;
    try {
      await ticketsAPI.delete(tid);
      setTickets(prev => prev.filter(t => t._id !== tid));
      success('Ticket deleted');
    } catch (err) {
      notifError('Delete failed');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Manage Tickets</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/organizer" className="btn btn-ghost">← Back</Link>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditTicket(null); }}>+ Add Ticket Type</button>
        </div>
      </div>
      {event && <p className="page-subtitle">Event: <strong>{event.title}</strong></p>}

      {showForm && (
        <div className="form-card">
          <h3>{editTicket ? 'Edit Ticket' : 'New Ticket Type'}</h3>
          <TicketForm eventId={id} onSubmit={handleCreate} loading={loading} initial={editTicket || {}} />
          <button className="btn btn-ghost" style={{ marginTop: 12 }} onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <div className="tickets-manage-list">
        {tickets.length === 0 ? (
          <div className="dashboard-empty"><div className="empty-icon">🎫</div><h3>No tickets yet</h3><p>Add ticket types to your event</p></div>
        ) : (
          tickets.map(t => (
            <div key={t._id} className="ticket-manage-card">
              <div className="ticket-manage-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3>{t.name}</h3>
                  <span className={`ticket-type-badge ticket-${t.type}`}>{t.type}</span>
                  {!t.isActive && <span className="badge-inactive">Inactive</span>}
                </div>
                <p>{t.description}</p>
                <div className="ticket-manage-meta">
                  <span>💰 {formatCurrency(t.price, t.currency)}</span>
                  <span>🎫 {t.soldQuantity} / {t.totalQuantity} sold</span>
                  <span>👤 Max {t.maxPerBooking} per booking</span>
                </div>
                <div className="capacity-bar" style={{ marginTop: 8 }}>
                  <div className="capacity-fill" style={{ width: `${Math.min((t.soldQuantity / t.totalQuantity) * 100, 100)}%` }} />
                </div>
              </div>
              <div className="ticket-manage-actions">
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Event Bookings view
const EventBookings = () => {
  const { id } = require('react-router-dom').useParams();
  const { error: notifError } = useNotif();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getByEvent(id).then(({ data }) => setBookings(data.bookings)).catch(() => notifError('Failed to load')).finally(() => setLoading(false));
  }, [id]);

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header">
        <h1>Event Bookings</h1>
        <Link to="/organizer" className="btn btn-ghost">← Back</Link>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">🎫</div><div className="stat-info"><h3>{bookings.length}</h3><p>Total Bookings</p></div></div>
        <div className="stat-card"><div className="stat-icon">✅</div><div className="stat-info"><h3>{bookings.filter(b => b.status === 'confirmed').length}</h3><p>Confirmed</p></div></div>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-info"><h3>{formatCurrency(totalRevenue)}</h3><p>Revenue</p></div></div>
        <div className="stat-card"><div className="stat-icon">✔️</div><div className="stat-info"><h3>{bookings.filter(b => b.checkedIn).length}</h3><p>Checked In</p></div></div>
      </div>
      {loading ? <Spinner /> : (
        <div className="organizer-events-table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Ref</th><th>Attendee</th><th>Ticket</th><th>Qty</th><th>Amount</th><th>Status</th><th>Checked In</th></tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b._id}>
                  <td><code>{b.bookingRef}</code></td>
                  <td>{b.user?.name}<br /><small>{b.user?.email}</small></td>
                  <td>{b.ticket?.name}</td>
                  <td>{b.quantity}</td>
                  <td>{formatCurrency(b.totalAmount, b.currency)}</td>
                  <td><span className="status-pill" style={{ background: getStatusColor(b.status) + '22', color: getStatusColor(b.status) }}>{b.status}</span></td>
                  <td>{b.checkedIn ? '✅ Yes' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && <div className="dashboard-empty"><p>No bookings yet.</p></div>}
        </div>
      )}
    </div>
  );
};

// Organizer Dashboard main with nested routes
const OrganizerDashboard = () => (
  <DashboardLayout>
    <Routes>
      <Route index element={<OrgOverview />} />
      <Route path="events/new" element={<CreateEvent />} />
      <Route path="events/:id/edit" element={<EditEvent />} />
      <Route path="events/:id/tickets" element={<ManageTickets />} />
      <Route path="events/:id/bookings" element={<EventBookings />} />
      <Route path="bookings" element={<AllOrgBookings />} />
      <Route path="qr" element={<div className="dashboard-page"><div className="dashboard-page-header"><h1>QR Check-In</h1></div><QRScanner /></div>} />
    </Routes>
  </DashboardLayout>
);

const AllOrgBookings = () => {
  const { error: notifError } = useNotif();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventsAPI.getMyEvents().then(({ data }) => setEvents(data.events)).catch(() => notifError('Failed')).finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header"><h1>All Bookings</h1></div>
      {loading ? <Spinner /> : (
        <div className="events-bookings-list">
          {events.map(ev => (
            <div key={ev._id} className="event-booking-summary">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><h3>{ev.title}</h3><p>{formatDate(ev.startDate)} • {ev.venue?.city}</p></div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span>{ev.bookingsCount} bookings</span>
                  <span>{formatCurrency(ev.revenue || 0)}</span>
                  <Link to={`/organizer/events/${ev._id}/bookings`} className="btn btn-outline btn-sm">View</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
