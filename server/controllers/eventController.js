const Event = require('../models/Event');
const Ticket = require('../models/Ticket');
const Booking = require('../models/Booking');

exports.getEvents = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { 'venue.city': { $regex: search, $options: 'i' } }];
    if (category) query.category = category;
    if (status) query.status = status;
    else query.status = 'published';

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email avatar')
      .sort({ startDate: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('organizer', 'name email avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const tickets = await Ticket.find({ event: event._id, isActive: true });
    res.json({ success: true, event, tickets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this event' });
    }
    event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Ticket.deleteMany({ event: req.params.id });
    await Event.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });
    const eventsWithStats = await Promise.all(events.map(async (ev) => {
      const bookings = await Booking.countDocuments({ event: ev._id, status: { $ne: 'cancelled' } });
      const revenue = await Booking.aggregate([
        { $match: { event: ev._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]);
      return { ...ev.toObject(), bookingsCount: bookings, revenue: revenue[0]?.total || 0 };
    }));
    res.json({ success: true, events: eventsWithStats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isFeatured: true, status: 'published' })
      .populate('organizer', 'name')
      .limit(6)
      .sort({ startDate: 1 });
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
