const express = require('express');
const router = express.Router();
const {
  getUserAnalytics,
  getAdminAnalytics,
  getAdminUserAnalytics,
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/user', getUserAnalytics);
router.get('/admin', authorize('admin'), getAdminAnalytics);
router.get('/admin/user/:userId', authorize('admin'), getAdminUserAnalytics);

module.exports = router;
