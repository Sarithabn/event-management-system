import React, { useState } from 'react';

const TicketForm = ({ eventId, onSubmit, loading, initial = {} }) => {
  const [form, setForm] = useState({
    event: eventId, name: '', description: '', type: 'free', price: 0,
    currency: 'INR', totalQuantity: 100, maxPerBooking: 10,
    saleStartDate: '', saleEndDate: '', isActive: true, ...initial
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, price: form.type === 'free' ? 0 : Number(form.price), totalQuantity: Number(form.totalQuantity), maxPerBooking: Number(form.maxPerBooking) });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Ticket Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="General, VIP, Early Bird..." />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea className="form-input form-textarea" value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="What's included..." />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Ticket Type</label>
          <select className="form-input" value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
        {form.type === 'paid' && (
          <div className="form-group">
            <label>Price (₹) *</label>
            <input className="form-input" type="number" min="1" value={form.price} onChange={e => set('price', e.target.value)} required />
          </div>
        )}
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Total Quantity *</label>
          <input className="form-input" type="number" min="1" value={form.totalQuantity} onChange={e => set('totalQuantity', e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Max Per Booking</label>
          <input className="form-input" type="number" min="1" value={form.maxPerBooking} onChange={e => set('maxPerBooking', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Sale Start Date</label>
          <input className="form-input" type="date" value={form.saleStartDate} onChange={e => set('saleStartDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Sale End Date</label>
          <input className="form-input" type="date" value={form.saleEndDate} onChange={e => set('saleEndDate', e.target.value)} />
        </div>
      </div>
      <div className="form-group form-check">
        <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
        <label htmlFor="isActive">Active (visible to users)</label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Saving...' : 'Save Ticket'}
      </button>
    </form>
  );
};

export default TicketForm;
