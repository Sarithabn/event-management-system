const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const bookingSchema = new mongoose.Schema({
  bookingRef: { type: String, unique: true, default: () => 'EVT-' + uuidv4().split('-')[0].toUpperCase() },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['confirmed', 'cancelled', 'pending', 'attended'], default: 'confirmed' },
  attendees: [{
    name: { type: String, required: true },
    email: { type: String, required: true }
  }],
  qrCode: { type: String, default: '' },
  checkedIn: { type: Boolean, default: false },
  checkedInAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason: { type: String },
  paymentMethod: { type: String, default: 'online' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);

