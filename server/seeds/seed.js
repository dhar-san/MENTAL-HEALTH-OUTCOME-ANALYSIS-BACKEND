/**
 * Seed Script - Populates database with sample data
 * Run: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Assessment = require('../models/Assessment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_health_analytics';

const sampleAssessments = [
  {
    title: 'Stress Assessment',
    description: 'Evaluate your stress levels',
    type: 'stress',
    questions: [
      { questionText: 'How often do you feel stressed?', options: [{ text: 'Never', score: 0 }, { text: 'Sometimes', score: 1 }, { text: 'Often', score: 2 }, { text: 'Always', score: 3 }], order: 0 },
      { questionText: 'Do you have trouble sleeping due to stress?', options: [{ text: 'No', score: 0 }, { text: 'Rarely', score: 1 }, { text: 'Sometimes', score: 2 }, { text: 'Yes, often', score: 3 }], order: 1 },
      { questionText: 'How well do you handle daily pressures?', options: [{ text: 'Very well', score: 0 }, { text: 'Well', score: 1 }, { text: 'Somewhat', score: 2 }, { text: 'Poorly', score: 3 }], order: 2 },
      { questionText: 'Do you experience physical symptoms of stress?', options: [{ text: 'Never', score: 0 }, { text: 'Rarely', score: 1 }, { text: 'Sometimes', score: 2 }, { text: 'Frequently', score: 3 }], order: 3 },
      { questionText: 'How often do you feel overwhelmed?', options: [{ text: 'Never', score: 0 }, { text: 'Rarely', score: 1 }, { text: 'Sometimes', score: 2 }, { text: 'Often', score: 3 }], order: 4 },
    ],
    scoringRules: [
      { level: 'Low', minScore: 0, maxScore: 5 },
      { level: 'Moderate', minScore: 6, maxScore: 10 },
      { level: 'Severe', minScore: 11, maxScore: 15 },
    ],
  },
  {
    title: 'Anxiety Screening',
    description: 'Assess anxiety levels',
    type: 'anxiety',
    questions: [
      { questionText: 'How often do you feel nervous or anxious?', options: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half', score: 2 }, { text: 'Nearly every day', score: 3 }], order: 0 },
      { questionText: 'Do you worry about things you cannot control?', options: [{ text: 'Never', score: 0 }, { text: 'Sometimes', score: 1 }, { text: 'Often', score: 2 }, { text: 'Always', score: 3 }], order: 1 },
      { questionText: 'Do you have trouble relaxing?', options: [{ text: 'No', score: 0 }, { text: 'Rarely', score: 1 }, { text: 'Sometimes', score: 2 }, { text: 'Yes', score: 3 }], order: 2 },
      { questionText: 'Have you experienced panic or rapid heartbeat?', options: [{ text: 'Never', score: 0 }, { text: 'Rarely', score: 1 }, { text: 'Sometimes', score: 2 }, { text: 'Often', score: 3 }], order: 3 },
      { questionText: 'Do you avoid situations that make you anxious?', options: [{ text: 'No', score: 0 }, { text: 'Rarely', score: 1 }, { text: 'Sometimes', score: 2 }, { text: 'Yes, often', score: 3 }], order: 4 },
    ],
    scoringRules: [
      { level: 'Low', minScore: 0, maxScore: 5 },
      { level: 'Moderate', minScore: 6, maxScore: 10 },
      { level: 'Severe', minScore: 11, maxScore: 15 },
    ],
  },
  {
    title: 'Depression Check',
    description: 'Evaluate mood and depressive symptoms',
    type: 'depression',
    questions: [
      { questionText: 'How often do you feel down or sad?', options: [{ text: 'Not at all', score: 0 }, { text: 'Several days', score: 1 }, { text: 'More than half', score: 2 }, { text: 'Nearly every day', score: 3 }], order: 0 },
      { questionText: 'Have you lost interest in activities you used to enjoy?', options: [{ text: 'No', score: 0 }, { text: 'A little', score: 1 }, { text: 'Somewhat', score: 2 }, { text: 'Yes, significantly', score: 3 }], order: 1 },
      { questionText: 'How is your energy level?', options: [{ text: 'Good', score: 0 }, { text: 'Moderate', score: 1 }, { text: 'Low', score: 2 }, { text: 'Very low', score: 3 }], order: 2 },
      { questionText: 'How is your sleep?', options: [{ text: 'Good', score: 0 }, { text: 'Occasional issues', score: 1 }, { text: 'Often disturbed', score: 2 }, { text: 'Severely affected', score: 3 }], order: 3 },
      { questionText: 'Do you feel hopeless about the future?', options: [{ text: 'No', score: 0 }, { text: 'Rarely', score: 1 }, { text: 'Sometimes', score: 2 }, { text: 'Often', score: 3 }], order: 4 },
    ],
    scoringRules: [
      { level: 'Low', minScore: 0, maxScore: 5 },
      { level: 'Moderate', minScore: 6, maxScore: 10 },
      { level: 'Severe', minScore: 11, maxScore: 15 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding');

    const admin = await User.findOne({ email: 'admin@example.com' });
    if (!admin) {
      const adminUser = await User.create({
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin created: admin@example.com / admin123');
    }

    const user = await User.findOne({ email: 'user@example.com' });
    if (!user) {
      const regularUser = await User.create({
        name: 'Test User',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
      });
      console.log('User created: user@example.com / user123');
    }

    const count = await Assessment.countDocuments();
    if (count === 0) {
      const adminUser = await User.findOne({ role: 'admin' });
      const regularUser = await User.findOne({ role: 'user' });
      const assessments = sampleAssessments.map((a) => ({
        ...a,
        createdBy: adminUser?._id,
      }));
      const created = await Assessment.insertMany(assessments);
      console.log('Sample assessments created');

      // Assign all assessments to test user
      if (regularUser && created.length > 0) {
        await User.findByIdAndUpdate(regularUser._id, {
          assignedAssessments: created.map((a) => a._id),
          $push: {
            notifications: {
              message: `New assessments have been assigned to you`,
              type: 'assigned',
              assessment: created[0]._id,
            },
          },
        });
        console.log('Assessments assigned to test user');
      }
    }

    console.log('Seed completed');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
