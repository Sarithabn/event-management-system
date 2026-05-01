import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import { formatDate, getInitials } from '../../utils/helpers';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';

const AdminUsers = () => {
  const { success, error: notifError } = useNotif();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: '', isActive: true });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({ search, role: roleFilter });
      setUsers(data.users);
    } catch { notifError('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const handleEdit = (user) => {
    setEditUser(user);
    setEditForm({ role: user.role, isActive: user.isActive });
  };

  const handleUpdate = async () => {
    try {
      await adminAPI.updateUser(editUser._id, editForm);
      success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch { notifError('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await adminAPI.deleteUser(id);
      success('User deleted');
      fetchUsers();
    } catch (err) { notifError(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div><h1>👥 User Management</h1><p>Manage platform users and their roles</p></div>
        </div>

        <div className="table-controls">
          <input className="form-input search-small" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="form-input select-small" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="organizer">Organizer</option>
            <option value="user">User</option>
          </select>
        </div>

        {loading ? <Spinner /> : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-sm">{getInitials(u.name)}</div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                    <td><span className={`status-pill ${u.isActive ? 'active' : 'inactive'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-outline btn-xs" onClick={() => handleEdit(u)}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={() => handleDelete(u._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="edit-user-form">
            <p className="edit-user-name">{editUser.name} ({editUser.email})</p>
            <div className="form-group">
              <label>Role</label>
              <select className="form-input" value={editForm.role} onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="organizer">Organizer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group form-check">
              <input type="checkbox" id="isActive" checked={editForm.isActive} onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))} />
              <label htmlFor="isActive">Account Active</label>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setEditUser(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
};

export default AdminUsers;
