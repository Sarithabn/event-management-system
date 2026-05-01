const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalEvents, totalBookings, revenueResult] = await Promise.all([
      User.countDocuments(),
      Event.countDocuments(),
      Booking.countDocuments({ status: { $ne: 'cancelled' } }),
      Booking.aggregate([{ $match: { status: { $ne: 'cancelled' } } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }])
    ]);

    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    const categoryBreakdown = await Event.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const recentBookings = await Booking.find()
      .populate('user', 'name email')
      .populate('event', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: revenueResult[0]?.total || 0
      },
      monthlyRevenue,
      categoryBreakdown,
      recentBookings
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role, isActive }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: 'Cannot delete yourself' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    const total = await Event.countDocuments(query);
    const events = await Event.find(query).populate('organizer', 'name email').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, events, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.featureEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured }, { new: true });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
