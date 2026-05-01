const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBooking, cancelBooking, getEventBookings, checkIn } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventBookings);
router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/check-in', protect, authorize('organizer', 'admin'), checkIn);

module.exports = router;
