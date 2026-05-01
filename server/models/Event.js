const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['conference', 'concert', 'workshop', 'sports', 'exhibition', 'festival', 'networking', 'other'],
    default: 'other'
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  venue: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, default: 'India' },
    zipCode: { type: String }
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  coverImage: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String }],
  totalCapacity: { type: Number, default: 0 },
  bookedCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

eventSchema.virtual('availableSeats').get(function () {
  return this.totalCapacity - this.bookedCount;
});

eventSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Event', eventSchema);
