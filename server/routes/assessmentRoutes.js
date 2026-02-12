const express = require('express');
const router = express.Router();
const {
  getAssessments,
  getAssessment,
  createAssessment,
  updateAssessment,
  deleteAssessment,
  assignAssessment,
} = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/', getAssessments);
router.get('/:id', getAssessment);

// Admin only
router.post('/', authorize('admin'), createAssessment);
router.put('/:id', authorize('admin'), updateAssessment);
router.delete('/:id', authorize('admin'), deleteAssessment);
router.post('/:id/assign', authorize('admin'), assignAssessment);

module.exports = router;
