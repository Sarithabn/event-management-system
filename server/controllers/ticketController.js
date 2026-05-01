const Ticket = require('../models/Ticket');
const Event = require('../models/Event');

exports.createTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.body.event);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const ticket = await Ticket.create(req.body);
    // Update event total capacity
    const tickets = await Ticket.find({ event: event._id, isActive: true });
    const totalCapacity = tickets.reduce((sum, t) => sum + t.totalQuantity, 0);
    await Event.findByIdAndUpdate(event._id, { totalCapacity });
    res.status(201).json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ event: req.params.eventId });
    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, ticket: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('event');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (ticket.event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
