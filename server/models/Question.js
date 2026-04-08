/**
 * Question Model
 * Stores pre-defined mental health questions for automatic assignment
 * 1000 questions across stress, anxiety, depression categories
 */
const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  score: { type: Number, required: true },
});

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 4,
        message: 'Each question must have exactly 4 options',
      },
    },
    category: {
      type: String,
      enum: ['stress', 'anxiety', 'depression'],
      required: true,
    },
  },
  { timestamps: true }
);

questionSchema.index({ category: 1 });

module.exports = mongoose.model('Question', questionSchema);
