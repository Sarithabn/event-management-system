import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import { formatDate, formatCurrency, getStatusColor } from '../../utils/helpers';
import Spinner from '../../components/common/Spinner';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminOverview = () => {
  const { error: notifError } = useNotif();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(({ data: d }) => setData(d)).catch(() => notifError('Failed to load stats')).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header"><h1>Admin Overview</h1></div>
      {data && (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-card-accent"><div className="stat-icon">👥</div><div className="stat-info"><h3>{data.stats.totalUsers}</h3><p>Total Users</p></div></div>
            <div className="stat-card stat-card-accent"><div className="stat-icon">🗓️</div><div className="stat-info"><h3>{data.stats.totalEvents}</h3><p>Total Events</p></div></div>
            <div className="stat-card stat-card-accent"><div className="stat-icon">🎫</div><div className="stat-info"><h3>{data.stats.totalBookings}</h3><p>Total Bookings</p></div></div>
            <div className="stat-card stat-card-accent"><div className="stat-icon">💰</div><div className="stat-info"><h3>{formatCurrency(data.stats.totalRevenue)}</h3><p>Total Revenue</p></div></div>
          </div>

          <div className="admin-grid">
            <section className="dashboard-section">
              <h2>Recent Bookings</h2>
              <div className="organizer-events-table-wrap">
                <table className="data-table">
                  <thead><tr><th>User</th><th>Event</th><th>Amount</th><th>Date</th></tr></thead>
                  <tbody>
                    {data.recentBookings?.map(b => (
                      <tr key={b._id}>
                        <td>{b.user?.name}<br /><small>{b.user?.email}</small></td>
                        <td>{b.event?.title}</td>
                        <td>{formatCurrency(b.totalAmount)}</td>
                        <td>{formatDate(b.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="dashboard-section">
              <h2>Events by Category</h2>
              <div className="category-breakdown">
                {data.categoryBreakdown?.map(c => (
                  <div key={c._id} className="category-row">
                    <span className="category-name">{c._id}</span>
                    <div className="category-bar-wrap">
                      <div className="category-bar" style={{ width: `${Math.min((c.count / (data.stats.totalEvents || 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="category-count">{c.count}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};

const AdminUsers = () => {
  const { success, error: notifError } = useNotif();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search, role: roleFilter });
      setUsers(data.users);
    } catch { notifError('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleToggleActive = async (u) => {
    try {
      await adminAPI.updateUser(u._id, { isActive: !u.isActive, role: u.role });
      setUsers(prev => prev.map(usr => usr._id === u._id ? { ...usr, isActive: !u.isActive } : usr));
      success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
    } catch { notifError('Failed'); }
  };

  const handleRoleChange = async (u, role) => {
    try {
      await adminAPI.updateUser(u._id, { role, isActive: u.isActive });
      setUsers(prev => prev.map(usr => usr._id === u._id ? { ...usr, role } : usr));
      success('Role updated');
    } catch { notifError('Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminAPI.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      success('User deleted');
    } catch (err) { notifError(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header"><h1>Manage Users</h1><span className="count-badge">{users.length} users</span></div>
      <div className="admin-filters">
        <input className="form-input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 300 }} />
        <select className="form-input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ maxWidth: 150 }}>
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {loading ? <Spinner /> : (
        <div className="organizer-events-table-wrap">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td><strong>{u.name}</strong></td>
                  <td>{u.email}</td>
                  <td>
                    <select className="role-select" value={u.role} onChange={e => handleRoleChange(u, e.target.value)}>
                      <option value="user">User</option>
                      <option value="organizer">Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td><span className={`status-pill ${u.isActive ? 'status-active' : 'status-inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button className={`btn btn-sm ${u.isActive ? 'btn-warning' : 'btn-success'}`} onClick={() => handleToggleActive(u)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminEvents = () => {
  const { success, error: notifError } = useNotif();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setLoading(true);
    adminAPI.getAllEvents({ status }).then(({ data }) => setEvents(data.events)).catch(() => notifError('Failed')).finally(() => setLoading(false));
  }, [status]);

  const handleFeature = async (ev) => {
    try {
      await adminAPI.featureEvent(ev._id, { isFeatured: !ev.isFeatured });
      setEvents(prev => prev.map(e => e._id === ev._id ? { ...e, isFeatured: !e.isFeatured } : e));
      success(ev.isFeatured ? 'Event unfeatured' : 'Event featured!');
    } catch { notifError('Failed'); }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-page-header"><h1>All Events</h1><span className="count-badge">{events.length} events</span></div>
      <div className="admin-filters">
        <select className="form-input" value={status} onChange={e => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
          <option value="">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      {loading ? <Spinner /> : (
        <div className="organizer-events-table-wrap">
          <table className="data-table">
            <thead><tr><th>Title</th><th>Organizer</th><th>Date</th><th>Category</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id}>
                  <td><strong>{ev.title}</strong><br /><small>{ev.venue?.city}</small></td>
                  <td>{ev.organizer?.name}</td>
                  <td>{formatDate(ev.startDate)}</td>
                  <td>{ev.category}</td>
                  <td><span className="status-pill" style={{ background: getStatusColor(ev.status) + '22', color: getStatusColor(ev.status) }}>{ev.status}</span></td>
                  <td>{ev.isFeatured ? '⭐' : '—'}</td>
                  <td>
                    <div className="table-actions">
                      <Link to={`/events/${ev._id}`} className="btn btn-ghost btn-xs">View</Link>
                      <button className={`btn btn-xs ${ev.isFeatured ? 'btn-outline' : 'btn-primary'}`} onClick={() => handleFeature(ev)}>{ev.isFeatured ? 'Unfeature' : 'Feature'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => (
  <DashboardLayout>
    <Routes>
      <Route index element={<AdminOverview />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="events" element={<AdminEvents />} />
      <Route path="analytics" element={<div className="dashboard-page"><div className="dashboard-page-header"><h1>Analytics</h1></div><p>Advanced analytics coming soon.</p></div>} />
    </Routes>
  </DashboardLayout>
);

export default AdminDashboard;
