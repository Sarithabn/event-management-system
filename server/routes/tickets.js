const express = require('express');
const router = express.Router();
const { createTicket, getEventTickets, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('organizer', 'admin'), createTicket);
router.get('/event/:eventId', getEventTickets);
router.put('/:id', protect, authorize('organizer', 'admin'), updateTicket);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteTicket);

module.exports = router;
