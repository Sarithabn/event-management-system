const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['free', 'paid'], default: 'free' },
  price: { type: Number, default: 0 },
  currency: { type: String, default: 'INR' },
  totalQuantity: { type: Number, required: true },
  soldQuantity: { type: Number, default: 0 },
  maxPerBooking: { type: Number, default: 10 },
  saleStartDate: { type: Date },
  saleEndDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

ticketSchema.virtual('availableQuantity').get(function () {
  return this.totalQuantity - this.soldQuantity;
});

module.exports = mongoose.model('Ticket', ticketSchema);
