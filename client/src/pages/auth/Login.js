import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';

const Login = () => {
  const { login } = useAuth();
  const { success, error: notifError } = useNotif();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      success(`Welcome back, ${data.user.name}!`);
      const dest = data.user.role === 'admin' ? '/admin' : data.user.role === 'organizer' ? '/organizer' : from;
      navigate(dest, { replace: true });
    } catch (err) {
      notifError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">◈ EventSphere</Link>
          <h1>Welcome back</h1>
          <p>Sign in to manage your events and bookings</p>
        </div>
        <div className="auth-illustration">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-card-preview">
            <div className="preview-event">🎤 TechConf 2025</div>
            <div className="preview-event">🎵 Jazz Night Live</div>
            <div className="preview-event">🛠️ React Workshop</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-title">Sign In</h2>
          <p className="auth-subtitle">Don't have an account? <Link to="/register">Create one free</Link></p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-toggle">
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign In'}
            </button>
          </form>

          <div className="auth-demo">
            <p className="demo-label">Demo Accounts:</p>
            <div className="demo-accounts">
              <button className="demo-btn" onClick={() => setForm({ email: 'admin@eventsphere.com', password: 'admin123' })}>
                Admin
              </button>
              <button className="demo-btn" onClick={() => setForm({ email: 'organizer@eventsphere.com', password: 'org123' })}>
                Organizer
              </button>
              <button className="demo-btn" onClick={() => setForm({ email: 'user@eventsphere.com', password: 'user123' })}>
                User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
