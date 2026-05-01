import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/events', label: 'All Events', icon: '🗓️' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
];

const organizerLinks = [
  { to: '/organizer', label: 'Overview', icon: '📊', end: true },
  { to: '/organizer/events', label: 'My Events', icon: '🗓️' },
  { to: '/organizer/events/new', label: 'Create Event', icon: '➕' },
  { to: '/organizer/bookings', label: 'Bookings', icon: '🎫' },
  { to: '/organizer/qr', label: 'QR Check-In', icon: '📷' },
];

const userLinks = [
  { to: '/dashboard', label: 'Overview', icon: '🏠', end: true },
  { to: '/bookings', label: 'My Bookings', icon: '🎫' },
  { to: '/events', label: 'Browse Events', icon: '🔍' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

const Sidebar = () => {
  const { user } = useAuth();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'organizer' ? organizerLinks : userLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar">{getInitials(user?.name)}</div>
        <div className="sidebar-user-info">
          <p className="sidebar-name">{user?.name}</p>
          <span className={`sidebar-role-badge sidebar-role-${user?.role}`}>{user?.role}</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span className="sidebar-version">EventSphere v1.0</span>
      </div>
    </aside>
  );
};

export default Sidebar;
