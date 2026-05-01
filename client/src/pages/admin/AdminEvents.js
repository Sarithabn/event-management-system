import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import { formatDate, getStatusColor } from '../../utils/helpers';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';

const AdminEvents = () => {
  const { success, error: notifError } = useNotif();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getAllEvents({ status: statusFilter });
      setEvents(data.events);
    } catch { notifError('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [statusFilter]);

  const handleFeature = async (id, current) => {
    try {
      await adminAPI.featureEvent(id, { isFeatured: !current });
      success(!current ? 'Event featured' : 'Event unfeatured');
      fetchEvents();
    } catch { notifError('Failed to update'); }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div><h1>🗓️ All Events</h1><p>Manage and moderate platform events</p></div>
        </div>

        <div className="table-controls">
          <select className="form-input select-small" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading ? <Spinner /> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Event</th><th>Organizer</th><th>Date</th><th>Bookings</th><th>Status</th><th>Featured</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev._id}>
                    <td><strong>{ev.title}</strong><br /><small>{ev.venue?.city}</small></td>
                    <td>{ev.organizer?.name}</td>
                    <td>{formatDate(ev.startDate)}</td>
                    <td>{ev.bookedCount} / {ev.totalCapacity}</td>
                    <td><span style={{ color: getStatusColor(ev.status) }}>● {ev.status}</span></td>
                    <td>
                      <button className={`toggle-btn ${ev.isFeatured ? 'on' : 'off'}`} onClick={() => handleFeature(ev._id, ev.isFeatured)}>
                        {ev.isFeatured ? '⭐ Yes' : '☆ No'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <Link to={`/events/${ev._id}`} className="btn btn-outline btn-xs">View</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminEvents;
