/**
 * Analytics Controller
 * Provides aggregated data for dashboards and charts
 */
const Response = require('../models/Response');
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get user's personal analytics (progress over time)
// @route   GET /api/analytics/user
// @access  Private/User
exports.getUserAnalytics = async (req, res) => {
  try {
    const responses = await Response.find({ user: req.user.id })
      .populate('assessment', 'title type')
      .sort('completedAt');

    const progressByAssessment = {};
    responses.forEach((r) => {
      const key = r.assessment?._id?.toString();
      if (!key) return;
      if (!progressByAssessment[key]) {
        progressByAssessment[key] = {
          title: r.assessment.title,
          type: r.assessment.type,
          data: [],
        };
      }
      progressByAssessment[key].data.push({
        date: r.completedAt,
        score: r.totalScore,
        severity: r.severityLevel,
      });
    });

    const severityDistribution = { Low: 0, Moderate: 0, Severe: 0 };
    responses.forEach((r) => {
      severityDistribution[r.severityLevel] =
        (severityDistribution[r.severityLevel] || 0) + 1;
    });

    res.json({
      success: true,
      analytics: {
        totalResponses: responses.length,
        progressByAssessment: Object.values(progressByAssessment),
        severityDistribution,
        recentResponses: responses.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin analytics (aggregated trends, severity distribution)
// @route   GET /api/analytics/admin
// @access  Private/Admin
exports.getAdminAnalytics = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const responses = await Response.find({
      completedAt: { $gte: thirtyDaysAgo },
    })
      .populate('assessment', 'title type')
      .populate('user', 'name email');

    // Severity distribution
    const severityDistribution = { Low: 0, Moderate: 0, Severe: 0 };
    responses.forEach((r) => {
      severityDistribution[r.severityLevel] =
        (severityDistribution[r.severityLevel] || 0) + 1;
    });

    // Trends over time (by day)
    const trendsByDay = {};
    responses.forEach((r) => {
      const dateKey = r.completedAt.toISOString().split('T')[0];
      if (!trendsByDay[dateKey]) {
        trendsByDay[dateKey] = { count: 0, avgScore: 0, totalScore: 0 };
      }
      trendsByDay[dateKey].count++;
      trendsByDay[dateKey].totalScore += r.totalScore;
    });
    const trendData = Object.entries(trendsByDay).map(([date, d]) => ({
      date,
      count: d.count,
      avgScore: Math.round((d.totalScore / d.count) * 10) / 10,
    }));

    // By assessment type
    const byAssessmentType = {};
    responses.forEach((r) => {
      const type = r.assessment?.type || 'unknown';
      if (!byAssessmentType[type]) {
        byAssessmentType[type] = { count: 0, severity: { Low: 0, Moderate: 0, Severe: 0 } };
      }
      byAssessmentType[type].count++;
      byAssessmentType[type].severity[r.severityLevel]++;
    });

    // Participation stats
    const assessments = await Assessment.find().select('title type');
    const participationStats = await Promise.all(
      assessments.map(async (a) => {
        const count = await Response.countDocuments({ assessment: a._id });
        return {
          assessmentId: a._id,
          title: a.title,
          type: a.type,
          completionCount: count,
        };
      })
    );

    // Recent responses with user names (all time, most recent first)
    const recentResponses = await Response.find()
      .populate('assessment', 'title type')
      .populate('user', 'name email')
      .sort({ completedAt: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      analytics: {
        totalResponses: responses.length,
        severityDistribution,
        trendsByDay: trendData.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
        byAssessmentType,
        participationStats,
        uniqueUsers: [...new Set(responses.map((r) => r.user?._id?.toString()))].length,
        recentResponses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a specific user's analytics (admin view)
// @route   GET /api/analytics/admin/user/:userId
// @access  Private/Admin
exports.getAdminUserAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const responses = await Response.find({ user: userId })
      .populate('assessment', 'title type')
      .sort('completedAt');

    const progressByAssessment = {};
    responses.forEach((r) => {
      const key = r.assessment?._id?.toString();
      if (!key) return;
      if (!progressByAssessment[key]) {
        progressByAssessment[key] = {
          title: r.assessment.title,
          type: r.assessment.type,
          data: [],
        };
      }
      progressByAssessment[key].data.push({
        date: r.completedAt,
        score: r.totalScore,
        severity: r.severityLevel,
      });
    });

    const severityDistribution = { Low: 0, Moderate: 0, Severe: 0 };
    responses.forEach((r) => {
      severityDistribution[r.severityLevel] =
        (severityDistribution[r.severityLevel] || 0) + 1;
    });

    const user = await User.findById(userId).select('name email');

    res.json({
      success: true,
      user: user || null,
      analytics: {
        totalResponses: responses.length,
        progressByAssessment: Object.values(progressByAssessment),
        severityDistribution,
        recentResponses: responses.slice(0, 10),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
