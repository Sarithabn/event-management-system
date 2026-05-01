const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, user });
});

module.exports = router;
