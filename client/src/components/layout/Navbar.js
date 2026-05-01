import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'organizer') return '/organizer';
    return '/dashboard';
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">EventSphere</span>
        </Link>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/events" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
            Browse Events
          </NavLink>

          {isAuthenticated && user?.role === 'organizer' && (
            <NavLink to="/organizer" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              My Events
            </NavLink>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
              Admin
            </NavLink>
          )}

          {!isAuthenticated ? (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-ghost" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </div>
          ) : (
            <div className="navbar-user" onClick={() => setDropOpen(!dropOpen)}>
              <div className="user-avatar-sm">{getInitials(user?.name)}</div>
              <span className="user-name-sm">{user?.name?.split(' ')[0]}</span>
              <span className="dropdown-arrow">▾</span>
              {dropOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user?.name}</strong>
                    <span className="user-role-tag">{user?.role}</span>
                  </div>
                  <Link to={getDashboardPath()} className="dropdown-item" onClick={() => setDropOpen(false)}>Dashboard</Link>
                  <Link to="/bookings" className="dropdown-item" onClick={() => setDropOpen(false)}>My Bookings</Link>
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>Profile</Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item dropdown-item-danger" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
