/**
 * Assessment Model
 * Stores mental health assessments (stress, anxiety, depression) with questions
 * and scoring rules for outcome calculation
 */
const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },
  options: [
    {
      text: String,
      score: {
        type: Number,
        required: true,
      },
    },
  ],
  order: {
    type: Number,
    default: 0,
  },
});

const scoringRuleSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['Low', 'Moderate', 'Severe'],
    required: true,
  },
  minScore: { type: Number, required: true },
  maxScore: { type: Number, required: true },
});

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['stress', 'anxiety', 'depression', 'general'],
      required: true,
    },
    questions: [questionSchema],
    scoringRules: [scoringRuleSchema],
    totalMaxScore: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Calculate total max score from questions
assessmentSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    this.totalMaxScore = this.questions.reduce((sum, q) => {
      const maxOption = q.options.reduce((max, opt) =>
        opt.score > max ? opt.score : max
      , 0);
      return sum + maxOption;
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
