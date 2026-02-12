/**
 * Notification Controller
 * Manages user notifications (assigned assessments, completion)
 */
const User = require('../models/User');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('notifications')
      .populate('notifications.assessment', 'title');

    const notifications = (user.notifications || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const notif = user.notifications.id(req.params.id);
    if (notif) {
      notif.read = true;
      await user.save();
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
