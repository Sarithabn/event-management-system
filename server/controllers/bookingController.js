const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const QRCode = require('qrcode');

exports.createBooking = async (req, res) => {
  try {
    const { eventId, ticketId, quantity, attendees } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket || !ticket.isActive) return res.status(404).json({ message: 'Ticket not found or inactive' });
    if (ticket.availableQuantity < quantity) return res.status(400).json({ message: 'Not enough tickets available' });
    if (quantity > ticket.maxPerBooking) return res.status(400).json({ message: `Maximum ${ticket.maxPerBooking} tickets per booking` });

    const totalAmount = ticket.price * quantity;
    const booking = await Booking.create({
      user: req.user._id,
      event: eventId,
      ticket: ticketId,
      quantity,
      unitPrice: ticket.price,
      totalAmount,
      currency: ticket.currency,
      attendees: attendees || [{ name: req.user.name, email: req.user.email }]
    });

    // Generate QR
    const qrData = JSON.stringify({ bookingRef: booking.bookingRef, bookingId: booking._id });
    const qrCode = await QRCode.toDataURL(qrData);
    booking.qrCode = qrCode;
    await booking.save();

    // Update ticket sold count
    await Ticket.findByIdAndUpdate(ticketId, { $inc: { soldQuantity: quantity } });
    await Event.findByIdAndUpdate(eventId, { $inc: { bookedCount: quantity } });

    const populated = await Booking.findById(booking._id)
      .populate('event', 'title startDate venue coverImage')
      .populate('ticket', 'name price type');

    res.status(201).json({ success: true, booking: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event', 'title startDate endDate venue coverImage status')
      .populate('ticket', 'name price type')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('event', 'title startDate endDate venue coverImage organizer')
      .populate('ticket', 'name price type currency')
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking already cancelled' });

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancelReason = req.body.reason || 'User cancelled';
    await booking.save();

    await Ticket.findByIdAndUpdate(booking.ticket, { $inc: { soldQuantity: -booking.quantity } });
    await Event.findByIdAndUpdate(booking.event, { $inc: { bookedCount: -booking.quantity } });

    res.json({ success: true, message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEventBookings = async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const bookings = await Booking.find({ event: req.params.eventId })
      .populate('user', 'name email')
      .populate('ticket', 'name price')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkIn = async (req, res) => {
  try {
    const { bookingRef } = req.body;
    const booking = await Booking.findOne({ bookingRef })
      .populate('event', 'title organizer')
      .populate('user', 'name email');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status === 'cancelled') return res.status(400).json({ message: 'Booking is cancelled' });
    if (booking.checkedIn) return res.status(400).json({ message: 'Already checked in', booking });

    booking.checkedIn = true;
    booking.checkedInAt = new Date();
    booking.status = 'attended';
    await booking.save();

    res.json({ success: true, message: 'Check-in successful', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
