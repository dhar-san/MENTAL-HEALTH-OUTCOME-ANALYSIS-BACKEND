const express = require('express');
const router = express.Router();
const {
  submitResponse,
  getMyResponses,
  getResponsesByAssessment,
} = require('../controllers/responseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', submitResponse);
router.get('/', getMyResponses);
router.get('/assessment/:assessmentId', getResponsesByAssessment);

module.exports = router;
