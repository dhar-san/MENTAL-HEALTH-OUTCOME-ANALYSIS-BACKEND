/**
 * Response Model
 * Stores user assessment responses with calculated scores and severity levels
 */
const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
    },
    answers: [
      {
        questionIndex: Number,
        selectedOptionIndex: Number,
        score: Number,
      },
    ],
    totalScore: {
      type: Number,
      required: true,
    },
    severityLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'Severe'],
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for efficient queries on user and assessment
responseSchema.index({ user: 1, assessment: 1, completedAt: -1 });

module.exports = mongoose.model('Response', responseSchema);
