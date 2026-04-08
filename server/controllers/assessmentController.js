/**
 * Assessment Controller
 * CRUD operations for mental health assessments (Admin)
 * Fetching assigned assessments (User)
 * Automatic random question assignment for users
 */
const Assessment = require('../models/Assessment');
const Question = require('../models/Question');
const User = require('../models/User');
const UserAssessment = require('../models/UserAssessment');
const mongoose = require('mongoose');

const QUESTIONS_PER_USER = 10;

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

// @desc    Get random questions for automatic assignment
// @route   GET /api/assessments/random-questions
// @access  Private (User only)
exports.getRandomQuestions = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'This endpoint is for users only' });
    }

    const userId = req.user.id;

    // Get previously assigned question IDs for this user
    let userAssessment = await UserAssessment.findOne({ user: userId });
    const excludedIds = userAssessment?.questionIds || [];

    // Build aggregation pipeline: sample questions excluding previously assigned
    const matchStage = excludedIds.length > 0
      ? { $match: { _id: { $nin: excludedIds } } }
      : { $match: {} };

    const questions = await Question.aggregate([
      matchStage,
      { $sample: { size: QUESTIONS_PER_USER } },
    ]);

    if (questions.length < QUESTIONS_PER_USER) {
      // Not enough new questions - reset and assign from full pool
      const fallbackQuestions = await Question.aggregate([
        { $sample: { size: QUESTIONS_PER_USER } },
      ]);
      if (fallbackQuestions.length === 0) {
        return res.status(503).json({
          message: 'No questions available. Please run the question seed script.',
        });
      }
      // Use whatever we got
      const qIds = fallbackQuestions.map((q) => q._id);
      if (userAssessment) {
        await UserAssessment.findByIdAndUpdate(userAssessment._id, {
          $addToSet: { questionIds: { $each: qIds } },
          lastAssignedAt: new Date(),
        });
      } else {
        await UserAssessment.create({ user: userId, questionIds: qIds });
      }
      return createAndReturnAssessment(req, res, fallbackQuestions, userId);
    }

    const questionIds = questions.map((q) => q._id);

    // Update UserAssessment - add new question IDs
    if (userAssessment) {
      await UserAssessment.findByIdAndUpdate(userAssessment._id, {
        $addToSet: { questionIds: { $each: questionIds } },
        lastAssignedAt: new Date(),
      });
    } else {
      await UserAssessment.create({ user: userId, questionIds });
    }

    return createAndReturnAssessment(req, res, questions, userId);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function createAndReturnAssessment(req, res, questions, userId) {
  // Transform questions to Assessment format (questionText, options with text/score)
  const assessmentQuestions = questions.map((q, idx) => ({
    questionText: q.questionText,
    options: q.options.map((opt) => ({ text: opt.text, score: opt.score })),
    order: idx,
  }));

  const maxScore = assessmentQuestions.reduce((sum, q) => {
    const maxOpt = Math.max(...q.options.map((o) => o.score));
    return sum + maxOpt;
  }, 0);

  const scoringRules = [
    { level: 'Low', minScore: 0, maxScore: Math.floor(maxScore * 0.33) },
    { level: 'Moderate', minScore: Math.floor(maxScore * 0.33) + 1, maxScore: Math.floor(maxScore * 0.66) },
    { level: 'Severe', minScore: Math.floor(maxScore * 0.66) + 1, maxScore: maxScore },
  ];

  const assessment = await Assessment.create({
    title: 'Mental Health Check',
    description: 'Personalized assessment based on your wellness journey',
    type: 'general',
    questions: assessmentQuestions,
    scoringRules,
    isActive: true,
    createdBy: req.user.id,
  });

  // Add to user's assigned assessments
  await User.findByIdAndUpdate(userId, {
    $addToSet: { assignedAssessments: assessment._id },
    $push: {
      notifications: {
        message: 'New mental health assessment has been assigned to you',
        type: 'assigned',
        assessment: assessment._id,
      },
    },
  });

  res.json({
    success: true,
    assessment: {
      _id: assessment._id,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      questions: assessment.questions,
    },
  });
}

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
