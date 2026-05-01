import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ticketsAPI, eventsAPI } from '../../services/api';
import { useNotif } from '../../context/NotifContext';
import { formatCurrency } from '../../utils/helpers';
import TicketForm from '../../components/tickets/TicketForm';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

const ManageTickets = () => {
  const { eventId } = useParams();
  const { success, error: notifError } = useNotif();
  const [tickets, setTickets] = useState([]);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editTicket, setEditTicket] = useState(null);

  const fetchAll = async () => {
    try {
      const [ticketsRes, eventRes] = await Promise.all([
        ticketsAPI.getByEvent(eventId),
        eventsAPI.getOne(eventId)
      ]);
      setTickets(ticketsRes.data.tickets);
      setEvent(eventRes.data.event);
    } catch { notifError('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [eventId]);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await ticketsAPI.create(data);
      success('Ticket created!');
      setShowAdd(false);
      fetchAll();
    } catch (err) { notifError(err.response?.data?.message || 'Failed'); }
    finally { setFormLoading(false); }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await ticketsAPI.update(editTicket._id, data);
      success('Ticket updated!');
      setEditTicket(null);
      fetchAll();
    } catch (err) { notifError(err.response?.data?.message || 'Failed'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this ticket type?')) return;
    try {
      await ticketsAPI.delete(id);
      success('Ticket deleted');
      fetchAll();
    } catch { notifError('Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <h1>🎫 Manage Tickets</h1>
            <p>{event?.title}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Ticket Type</button>
        </div>

        {loading ? <Spinner /> : tickets.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">🎫</p>
            <h3>No tickets yet</h3>
            <p>Add ticket types for your event</p>
            <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Add First Ticket</button>
          </div>
        ) : (
          <div className="tickets-management-list">
            {tickets.map(t => (
              <div key={t._id} className={`ticket-manage-card ${!t.isActive ? 'inactive' : ''}`}>
                <div className="ticket-manage-header">
                  <div>
                    <h3>{t.name}</h3>
                    <span className={`ticket-type-badge ${t.type}`}>{t.type === 'free' ? '🆓 Free' : `💰 ${formatCurrency(t.price)}`}</span>
                  </div>
                  {!t.isActive && <span className="inactive-badge">Inactive</span>}
                </div>
                {t.description && <p className="ticket-manage-desc">{t.description}</p>}
                <div className="ticket-manage-stats">
                  <div><label>Sold</label><span>{t.soldQuantity}</span></div>
                  <div><label>Available</label><span>{t.totalQuantity - t.soldQuantity}</span></div>
                  <div><label>Total</label><span>{t.totalQuantity}</span></div>
                  <div><label>Max/Booking</label><span>{t.maxPerBooking}</span></div>
                </div>
                <div className="ticket-manage-progress">
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(t.soldQuantity / t.totalQuantity) * 100}%` }} />
                  </div>
                  <span>{Math.round((t.soldQuantity / t.totalQuantity) * 100)}% sold</span>
                </div>
                <div className="ticket-manage-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setEditTicket(t)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Ticket Type" size="lg">
        <TicketForm eventId={eventId} onSubmit={handleCreate} loading={formLoading} />
      </Modal>

      <Modal isOpen={!!editTicket} onClose={() => setEditTicket(null)} title="Edit Ticket Type" size="lg">
        {editTicket && <TicketForm eventId={eventId} initial={editTicket} onSubmit={handleUpdate} loading={formLoading} />}
      </Modal>
    </DashboardLayout>
  );
};

export default ManageTickets;
