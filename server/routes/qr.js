const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const { protect, authorize } = require('../middleware/auth');

router.get('/validate/:bookingRef', protect, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const booking = await Booking.findOne({ bookingRef: req.params.bookingRef })
      .populate('user', 'name email')
      .populate('event', 'title startDate venue')
      .populate('ticket', 'name');
    if (!booking) return res.status(404).json({ message: 'Booking not found', valid: false });
    res.json({
      valid: true,
      checkedIn: booking.checkedIn,
      booking: {
        ref: booking.bookingRef,
        status: booking.status,
        checkedIn: booking.checkedIn,
        checkedInAt: booking.checkedInAt,
        quantity: booking.quantity,
        attendees: booking.attendees,
        user: booking.user,
        event: booking.event,
        ticket: booking.ticket
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
