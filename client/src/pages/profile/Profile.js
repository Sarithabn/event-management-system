import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';
import { authAPI } from '../../services/api';
import { getInitials, formatDate } from '../../utils/helpers';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { success, error: notifError } = useNotif();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      success('Profile updated!');
    } catch (err) {
      notifError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { notifError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { notifError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      notifError(err.response?.data?.message || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container" style={{ maxWidth: 720, margin: '40px auto' }}>
        <div className="profile-header">
          <div className="profile-avatar-lg">{getInitials(user?.name)}</div>
          <div>
            <h1>{user?.name}</h1>
            <p className="text-muted">{user?.email}</p>
            <span className={`sidebar-role-badge sidebar-role-${user?.role}`}>{user?.role}</span>
          </div>
        </div>

        <div className="profile-tabs">
          {['profile', 'security'].map(t => (
            <button key={t} className={`profile-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'profile' ? 'Profile Info' : 'Security'}
            </button>
          ))}
        </div>

        {activeTab === 'profile' && (
          <form className="profile-form" onSubmit={handleProfileSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-input" value={user?.email} disabled />
              <small className="form-hint">Email cannot be changed</small>
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9999999999" />
            </div>
            <div className="form-group">
              <label>Avatar URL</label>
              <input className="form-input" value={profileForm.avatar} onChange={e => setProfileForm(p => ({ ...p, avatar: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="form-group">
              <label>Role</label>
              <input className="form-input" value={user?.role} disabled />
            </div>
            <div className="form-group">
              <label>Member Since</label>
              <input className="form-input" value={formatDate(user?.createdAt)} disabled />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </form>
        )}

        {activeTab === 'security' && (
          <form className="profile-form" onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Current Password</label>
              <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input className="form-input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input className="form-input" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
