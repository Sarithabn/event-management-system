// server/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Booking  = require('../models/Booking');
const Ticket   = require('../models/Ticket');
const Event    = require('../models/Event');
const QRCode   = require('qrcode');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// STEP 1: Create Razorpay Order
// POST /api/payment/create-order
exports.createOrder = async (req, res) => {
  try {
    const { ticketId, quantity } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) 
      return res.status(404).json({ message: 'Ticket not found' });

    const available = ticket.totalQuantity - ticket.soldQuantity;
    if (available < quantity)
      return res.status(400).json({ message: `Only ${available} seats left` });

    const totalAmount = ticket.price * quantity;

    // Create order on Razorpay
    const order = await razorpay.orders.create({
      amount:   totalAmount * 100, // Razorpay needs paise (₹1 = 100 paise)
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
      notes: {
        ticketId:  ticketId,
        quantity:  quantity,
        userId:    req.user._id.toString(),
      },
    });

    res.json({
      success: true,
      orderId:    order.id,
      amount:     order.amount,
      currency:   order.currency,
      keyId:      process.env.RAZORPAY_KEY_ID,
      ticketName: ticket.name,
      totalAmount,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ message: err.message });
  }
};

// STEP 2: Verify Payment & Confirm Booking
// POST /api/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      eventId,
      ticketId,
      quantity,
      attendees,
    } = req.body;

    // ── Verify signature (security check) ──────────────
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed — invalid signature',
      });
    }

    // ── Payment verified → Create Booking ──────────────
    const ticket      = await Ticket.findById(ticketId);
    const totalAmount = ticket.price * quantity;

    const booking = await Booking.create({
      user:          req.user._id,
      event:         eventId,
      ticket:        ticketId,
      quantity,
      unitPrice:     ticket.price,
      totalAmount,
      currency:      'INR',
      paymentMethod: 'razorpay',
      paymentId:     razorpay_payment_id,
      orderId:       razorpay_order_id,
      paymentStatus: 'paid',
      attendees: attendees || [{ name: req.user.name, email: req.user.email }],
    });

    // Generate QR code
    const qrData   = JSON.stringify({ bookingRef: booking.bookingRef, bookingId: booking._id });
    booking.qrCode = await QRCode.toDataURL(qrData);
    await booking.save();

    // Update inventory
    await Ticket.findByIdAndUpdate(ticketId, { $inc: { soldQuantity: quantity } });
    await Event.findByIdAndUpdate(eventId,   { $inc: { bookedCount:  quantity } });

    const populated = await Booking.findById(booking._id)
      .populate('event',  'title startDate venue coverImage')
      .populate('ticket', 'name price type');

    res.status(201).json({
      success: true,
      message: 'Payment successful! Booking confirmed.',
      booking: populated,
    });
  } catch (err) {
    console.error('verifyPayment error:', err);
    res.status(500).json({ message: err.message });
  }
};

// STEP 3: Handle Refund on Cancellation
// POST /api/payment/refund/:bookingId
exports.refundPayment = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    if (booking.status === 'cancelled')
      return res.status(400).json({ message: 'Already cancelled' });

    if (!booking.paymentId)
      return res.status(400).json({ message: 'No payment found for this booking' });

    // Check refund eligibility (e.g., 24 hours before event)
    const event     = await Event.findById(booking.event);
    const hoursLeft = (new Date(event.startDate) - new Date()) / (1000 * 60 * 60);

    if (hoursLeft < 24) {
      return res.status(400).json({
        message: 'Refunds not allowed within 24 hours of event',
      });
    }

    // Initiate Razorpay refund
    const refund = await razorpay.payments.refund(booking.paymentId, {
      amount: booking.totalAmount * 100, // full refund
      notes:  { reason: req.body.reason || 'User requested cancellation' },
    });

    // Update booking
    booking.status        = 'cancelled';
    booking.cancelledAt   = new Date();
    booking.cancelReason  = req.body.reason || 'User cancelled';
    booking.refundId      = refund.id;
    booking.refundStatus  = 'processed';
    booking.paymentStatus = 'refunded';
    await booking.save();

    // Restore inventory
    await Ticket.findByIdAndUpdate(booking.ticket, { $inc: { soldQuantity: -booking.quantity } });
    await Event.findByIdAndUpdate(booking.event,   { $inc: { bookedCount:  -booking.quantity } });

    res.json({
      success: true,
      message: `Refund of ₹${booking.totalAmount} initiated. Will reflect in 5-7 business days.`,
      refundId: refund.id,
    });
  } catch (err) {
    console.error('refundPayment error:', err);
    res.status(500).json({ message: err.message });
  }
};