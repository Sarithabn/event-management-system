import React, { useState, useEffect } from 'react';

const CATEGORIES = ['conference', 'concert', 'workshop', 'sports', 'exhibition', 'festival', 'networking', 'other'];
const STATUSES = ['draft', 'published', 'cancelled'];

const EventForm = ({ initial = {}, onSubmit, loading }) => {
  const [form, setForm] = useState({
    title: '', description: '', category: 'other', status: 'draft',
    startDate: '', endDate: '', startTime: '', endTime: '', coverImage: '',
    venue: { name: '', address: '', city: '', state: '', country: 'India', zipCode: '' },
    tags: '',
    ...initial,
    venue: { name: '', address: '', city: '', state: '', country: 'India', zipCode: '', ...initial.venue }
  });

  useEffect(() => {
    if (initial && Object.keys(initial).length) {
      setForm(prev => ({
        ...prev, ...initial,
        tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : '',
        startDate: initial.startDate ? initial.startDate.slice(0, 10) : '',
        endDate: initial.endDate ? initial.endDate.slice(0, 10) : '',
        venue: { ...prev.venue, ...initial.venue }
      }));
    }
  }, [initial]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const setVenue = (field, value) => setForm(prev => ({ ...prev, venue: { ...prev.venue, [field]: value } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    onSubmit(payload);
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3 className="form-section-title">Basic Information</h3>
        <div className="form-group">
          <label>Event Title *</label>
          <input className="form-input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Enter event title" />
        </div>
        <div className="form-group">
          <label>Description *</label>
          <textarea className="form-input form-textarea" value={form.description} onChange={e => set('description', e.target.value)} required rows={5} placeholder="Describe your event..." />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Cover Image URL</label>
          <input className="form-input" value={form.coverImage} onChange={e => set('coverImage', e.target.value)} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label>Tags (comma separated)</label>
          <input className="form-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="music, outdoor, tech..." />
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Date & Time</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Start Date *</label>
            <input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Start Time *</label>
            <input className="form-input" type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} required />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>End Date *</label>
            <input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>End Time *</label>
            <input className="form-input" type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} required />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Venue</h3>
        <div className="form-group">
          <label>Venue Name *</label>
          <input className="form-input" value={form.venue.name} onChange={e => setVenue('name', e.target.value)} required placeholder="Convention Center, Stadium..." />
        </div>
        <div className="form-group">
          <label>Address *</label>
          <input className="form-input" value={form.venue.address} onChange={e => setVenue('address', e.target.value)} required placeholder="Street address" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>City *</label>
            <input className="form-input" value={form.venue.city} onChange={e => setVenue('city', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>State</label>
            <input className="form-input" value={form.venue.state} onChange={e => setVenue('state', e.target.value)} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Country</label>
            <input className="form-input" value={form.venue.country} onChange={e => setVenue('country', e.target.value)} />
          </div>
          <div className="form-group">
            <label>ZIP Code</label>
            <input className="form-input" value={form.venue.zipCode} onChange={e => setVenue('zipCode', e.target.value)} />
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
        {loading ? 'Saving...' : 'Save Event'}
      </button>
    </form>
  );
};

export default EventForm;
