import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotif } from '../../context/NotifContext';
import { authAPI } from '../../services/api';
import { getInitials } from '../../utils/helpers';
import DashboardLayout from '../../components/layout/DashboardLayout';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { success, error: notifError } = useNotif();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', avatar: user?.avatar || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const { data } = await authAPI.updateProfile(profileForm);
      updateUser(data.user);
      success('Profile updated!');
    } catch (err) { notifError(err.response?.data?.message || 'Update failed'); }
    finally { setProfileLoading(false); }
  };

  const handlePassChange = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return notifError('Passwords do not match');
    setPassLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      success('Password changed successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { notifError(err.response?.data?.message || 'Failed'); }
    finally { setPassLoading(false); }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>👤 My Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className="profile-layout">
          <div className="profile-sidebar-card">
            <div className="profile-avatar-lg">{getInitials(user?.name)}</div>
            <h3 className="profile-name">{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
          </div>

          <div className="profile-content">
            <div className="profile-tabs">
              <button className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>Profile Info</button>
              <button className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>Change Password</button>
            </div>

            {activeTab === 'profile' && (
              <form className="event-form" onSubmit={handleProfileSave}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input className="form-input" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>Email (read-only)</label>
                  <input className="form-input" value={user?.email} disabled />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-input" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
                </div>
                <div className="form-group">
                  <label>Avatar URL</label>
                  <input className="form-input" value={profileForm.avatar} onChange={e => setProfileForm(p => ({ ...p, avatar: e.target.value }))} placeholder="https://..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={profileLoading}>{profileLoading ? 'Saving...' : 'Save Changes'}</button>
              </form>
            )}

            {activeTab === 'password' && (
              <form className="event-form" onSubmit={handlePassChange}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input className="form-input" type="password" value={passForm.currentPassword} onChange={e => setPassForm(p => ({ ...p, currentPassword: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input className="form-input" type="password" value={passForm.newPassword} onChange={e => setPassForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input className="form-input" type="password" value={passForm.confirmPassword} onChange={e => setPassForm(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-primary" disabled={passLoading}>{passLoading ? 'Changing...' : 'Change Password'}</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
