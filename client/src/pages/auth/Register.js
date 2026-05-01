import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';

const Register = () => {
  const [params] = useSearchParams();
  const { register } = useAuth();
  const { success, error: notifError } = useNotif();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: params.get('role') || 'user'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return notifError('Passwords do not match');
    if (form.password.length < 6) return notifError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register({ name: form.name, email: form.email, password: form.password, role: form.role });
      success(`Welcome to EventSphere, ${data.user.name}!`);
      const dest = data.user.role === 'organizer' ? '/organizer' : '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      notifError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">◈ EventSphere</Link>
          <h1>Join EventSphere</h1>
          <p>Create your account and start exploring amazing events</p>
        </div>
        <div className="auth-illustration">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="auth-stats-preview">
            <div className="preview-stat"><span>10K+</span> Events</div>
            <div className="preview-stat"><span>500K+</span> Attendees</div>
            <div className="preview-stat"><span>1200+</span> Organizers</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Already have one? <Link to="/login">Sign in</Link></p>

          <div className="role-selector">
            {['user', 'organizer'].map(r => (
              <button
                key={r}
                type="button"
                className={`role-btn ${form.role === r ? 'active' : ''}`}
                onClick={() => set('role', r)}
              >
                {r === 'user' ? '👤 Attendee' : '🎤 Organizer'}
              </button>
            ))}
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" placeholder="John Doe" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-toggle">
                <input className="form-input" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(p => !p)}>{showPass ? '🙈' : '👁️'}</button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input className="form-input" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : `Create ${form.role === 'organizer' ? 'Organizer' : ''} Account`}
            </button>
          </form>
          <p className="auth-terms">By creating an account, you agree to our <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;