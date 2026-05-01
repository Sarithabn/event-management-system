const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Please provide name, email, and password' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const allowedRoles = ['user', 'organizer'];
    const userRole = allowedRoles.includes(role) ? role : 'user';
    const user = await User.create({ name, email, password, role: userRole });
    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Provide email and password' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });
    const token = signToken(user._id);
    res.json({ success: true, token, user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toPublic ? req.user.toPublic() : req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword))) return res.status(400).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
