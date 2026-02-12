/**
 * Assessment Controller
 * CRUD operations for mental health assessments (Admin)
 * and fetching assigned assessments (User)
 */
const Assessment = require('../models/Assessment');
const User = require('../models/User');

// @desc    Get all assessments (Admin) or assigned assessments (User)
// @route   GET /api/assessments
// @access  Private
exports.getAssessments = async (req, res) => {
  try {
    let assessments;
    
    if (req.user.role === 'admin') {
      assessments = await Assessment.find()
        .populate('createdBy', 'name')
        .sort('-createdAt');
    } else {
      assessments = await Assessment.find({
        _id: { $in: req.user.assignedAssessments || [] },
        isActive: true,
      }).sort('title');
    }

    res.json({ success: true, assessments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Private
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    if (req.user.role === 'user') {
      const isAssigned = req.user.assignedAssessments?.some(
        (id) => id.toString() === req.params.id
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Assessment not assigned to you' });
      }
    }

    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create assessment
// @route   POST /api/assessments
// @access  Private/Admin
exports.createAssessment = async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const assessment = await Assessment.create(req.body);
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update assessment
// @route   PUT /api/assessments/:id
// @access  Private/Admin
exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json({ success: true, assessment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete assessment
// @route   DELETE /api/assessments/:id
// @access  Private/Admin
exports.deleteAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.json({ success: true, message: 'Assessment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign assessment to users
// @route   POST /api/assessments/:id/assign
// @access  Private/Admin
exports.assignAssessment = async (req, res) => {
  try {
    const { userIds } = req.body;
    const assessmentId = req.params.id;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    const users = await User.updateMany(
      { _id: { $in: userIds }, role: 'user' },
      {
        $addToSet: { assignedAssessments: assessmentId },
        $push: {
          notifications: {
            message: `New assessment "${assessment.title}" has been assigned to you`,
            type: 'assigned',
            assessment: assessmentId,
          },
        },
      }
    );

    res.json({
      success: true,
      message: `Assessment assigned to ${users.modifiedCount} users`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
