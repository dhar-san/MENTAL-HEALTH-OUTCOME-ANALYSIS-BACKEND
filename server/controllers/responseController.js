/**
 * Response Controller
 * Submit assessment responses and retrieve history
 * Handles score calculation and severity classification
 */
const Response = require('../models/Response');
const Assessment = require('../models/Assessment');
const User = require('../models/User');

// @desc    Submit assessment response
// @route   POST /api/responses
// @access  Private
exports.submitResponse = async (req, res) => {
  try {
    const { assessmentId, answers } = req.body;

    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Verify user is assigned (for non-admin)
    if (req.user.role === 'user') {
      const isAssigned = req.user.assignedAssessments?.some(
        (id) => id.toString() === assessmentId
      );
      if (!isAssigned) {
        return res.status(403).json({ message: 'Assessment not assigned to you' });
      }
    }

    // Calculate total score from answers
    let totalScore = 0;
    const processedAnswers = answers.map((ans, idx) => {
      const question = assessment.questions[ans.questionIndex];
      const option = question?.options[ans.selectedOptionIndex];
      const score = option?.score ?? 0;
      totalScore += score;
      return {
        questionIndex: ans.questionIndex,
        selectedOptionIndex: ans.selectedOptionIndex,
        score,
      };
    });

    // Determine severity level from scoring rules
    const severityLevel = calculateSeverity(totalScore, assessment.scoringRules);

    const response = await Response.create({
      user: req.user.id,
      assessment: assessmentId,
      answers: processedAnswers,
      totalScore,
      severityLevel,
    });

    // Add completion notification
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        notifications: {
          message: `You completed "${assessment.title}". Result: ${severityLevel}`,
          type: 'completed',
          assessment: assessmentId,
        },
      },
    });

    res.status(201).json({
      success: true,
      response: {
        id: response._id,
        totalScore,
        severityLevel,
        completedAt: response.completedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to calculate severity from score ranges
function calculateSeverity(totalScore, scoringRules) {
  if (!scoringRules || scoringRules.length === 0) {
    if (totalScore < 10) return 'Low';
    if (totalScore < 20) return 'Moderate';
    return 'Severe';
  }
  const sorted = [...scoringRules].sort((a, b) => a.minScore - b.minScore);
  for (const rule of sorted) {
    if (totalScore >= rule.minScore && totalScore <= rule.maxScore) {
      return rule.level;
    }
  }
  return sorted[sorted.length - 1]?.level || 'Moderate';
}

// @desc    Get user's response history
// @route   GET /api/responses
// @access  Private
exports.getMyResponses = async (req, res) => {
  try {
    const responses = await Response.find({ user: req.user.id })
      .populate('assessment', 'title type')
      .sort('-completedAt');

    res.json({ success: true, responses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get response history for specific assessment
// @route   GET /api/responses/assessment/:assessmentId
// @access  Private
exports.getResponsesByAssessment = async (req, res) => {
  try {
    const responses = await Response.find({
      user: req.user.id,
      assessment: req.params.assessmentId,
    })
      .populate('assessment', 'title type')
      .sort('completedAt');

    res.json({ success: true, responses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
