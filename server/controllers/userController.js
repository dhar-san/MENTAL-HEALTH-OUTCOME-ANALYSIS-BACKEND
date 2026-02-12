/**
 * User Controller
 * Admin: List users for assignment
 */
const User = require('../models/User');

// @desc    Get all users (for admin assignment)
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('name email assignedAssessments')
      .populate('assignedAssessments', 'title type');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
