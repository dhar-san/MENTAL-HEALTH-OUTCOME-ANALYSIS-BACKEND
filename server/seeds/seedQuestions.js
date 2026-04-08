/**
 * Seed Script - Populates questions collection with 1000 mental health questions
 * Run: node server/seeds/seedQuestions.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mental_health_analytics';

// Standard options for Likert-scale (0-3 scoring)
const OPTIONS = [
  { text: 'Not at all', score: 0 },
  { text: 'Several days', score: 1 },
  { text: 'More than half the days', score: 2 },
  { text: 'Nearly every day', score: 3 },
];

const OPTIONS_NEVER = [
  { text: 'Never', score: 0 },
  { text: 'Rarely', score: 1 },
  { text: 'Sometimes', score: 2 },
  { text: 'Often / Always', score: 3 },
];

const OPTIONS_AGREE = [
  { text: 'Strongly disagree', score: 0 },
  { text: 'Disagree', score: 1 },
  { text: 'Agree', score: 2 },
  { text: 'Strongly agree', score: 3 },
];

const OPTIONS_WELL = [
  { text: 'Very well', score: 0 },
  { text: 'Somewhat well', score: 1 },
  { text: 'Not very well', score: 2 },
  { text: 'Not at all', score: 3 },
];

// Question templates by category
const STRESS_QUESTIONS = [
  'How often do you feel stressed?',
  'Do you have trouble sleeping due to stress?',
  'How well do you handle daily pressures?',
  'Do you experience physical symptoms of stress (headaches, tension)?',
  'How often do you feel overwhelmed?',
  'Do you have difficulty concentrating when stressed?',
  'How often do you feel irritable or short-tempered?',
  'Do you experience muscle tension when stressed?',
  'How well do you manage your time?',
  'Do you feel stressed about work or school?',
  'How often do you use unhealthy coping strategies (overeating, etc.)?',
  'Do you feel unable to relax?',
  'How stressed do you feel about your financial situation?',
  'Do you experience stress-related digestive issues?',
  'How often do you feel like you have too much to do?',
  'Do you have trouble switching off from work or responsibilities?',
  'How stressed do you feel about relationships?',
  'Do you feel stress affects your health?',
  'How often do you feel anxious about the future?',
  'Do you experience stress-related fatigue?',
  'How well do you cope with unexpected changes?',
  'Do you feel stressed about meeting others\' expectations?',
  'How often do you feel tense or on edge?',
  'Do you have difficulty making decisions when stressed?',
  'How stressed do you feel about your personal life?',
  'Do you experience stress-related sleep problems?',
  'How often do you feel you cannot keep up with demands?',
  'Do you feel stressed about your health?',
  'How well do you handle conflict?',
  'Do you experience stress-related mood swings?',
  'How often do you feel stressed about family matters?',
  'Do you have trouble delegating tasks?',
  'How stressed do you feel about social situations?',
  'Do you experience stress-related restlessness?',
  'How often do you feel you need a break?',
  'Do you feel stressed about performance at work or school?',
  'How well do you balance work and personal life?',
  'Do you experience stress-related irritability?',
  'How often do you feel mentally exhausted?',
  'Do you feel stressed about world events or news?',
  'How often do you engage in stress-reducing activities?',
  'Do you feel stressed about uncertainty?',
  'How well do you recover from stressful events?',
  'Do you experience stress-related forgetfulness?',
  'How often do you feel stressed about your appearance?',
  'Do you feel stressed about meeting deadlines?',
  'How often do you feel you have no control?',
  'Do you experience stress-related appetite changes?',
  'How stressed do you feel about commuting or travel?',
  'Do you feel stressed about technology or screen time?',
  'How often do you feel stressed about comparisons with others?',
  'Do you experience stress-related chest tightness?',
  'How well do you set boundaries with others?',
  'Do you feel stressed about aging or life transitions?',
];

const ANXIETY_QUESTIONS = [
  'How often do you feel nervous or anxious?',
  'Do you worry about things you cannot control?',
  'Do you have trouble relaxing?',
  'Have you experienced panic or rapid heartbeat?',
  'Do you avoid situations that make you anxious?',
  'How often do you feel restless or on edge?',
  'Do you worry excessively about different things?',
  'Do you have difficulty falling or staying asleep due to worry?',
  'How often do you feel tense?',
  'Do you experience physical symptoms of anxiety (sweating, trembling)?',
  'Do you avoid social situations due to anxiety?',
  'How often do you feel something bad will happen?',
  'Do you have trouble concentrating due to worry?',
  'Do you experience anxiety about health or illness?',
  'How often do you feel keyed up or unable to sit still?',
  'Do you worry about being judged by others?',
  'Do you experience anxiety in crowded places?',
  'How often do you feel irritable due to anxiety?',
  'Do you avoid making decisions due to fear?',
  'Do you experience anxiety about performance or tests?',
  'How often do you feel a sense of dread?',
  'Do you worry about the future?',
  'Do you experience anxiety about leaving home?',
  'How often do you feel jumpy or easily startled?',
  'Do you worry about saying or doing something wrong?',
  'Do you experience anxiety in new situations?',
  'How often do you feel unable to stop worrying?',
  'Do you worry about loved ones?',
  'Do you experience anxiety about public speaking?',
  'How often do you feel overwhelmed by worry?',
  'Do you avoid driving or traveling due to anxiety?',
  'Do you worry about making mistakes?',
  'How often do you feel a lump in your throat?',
  'Do you experience anxiety about being alone?',
  'Do you worry about your appearance?',
  'How often do you feel like you need to escape?',
  'Do you experience anxiety about being late?',
  'Do you worry about losing control?',
  'How often do you feel impending doom?',
  'Do you experience anxiety about authority figures?',
  'Do you worry about being embarrassed?',
  'How often do you feel shaky or trembling?',
  'Do you experience anxiety about flying?',
  'Do you worry about what others think of you?',
  'How often do you feel like something is wrong?',
  'Do you experience anxiety about elevators or enclosed spaces?',
  'Do you worry about accidents or disasters?',
  'How often do you feel your heart racing?',
  'Do you experience anxiety about meeting new people?',
  'Do you worry about your safety?',
  'How often do you feel nauseous due to anxiety?',
  'Do you experience anxiety about changes?',
  'Do you worry about being rejected?',
];

const DEPRESSION_QUESTIONS = [
  'How often do you feel down or sad?',
  'Have you lost interest in activities you used to enjoy?',
  'How is your energy level?',
  'How is your sleep?',
  'Do you feel hopeless about the future?',
  'How is your appetite?',
  'Do you feel worthless or guilty?',
  'Do you have difficulty concentrating?',
  'How often do you feel like moving or speaking slowly?',
  'Have you had thoughts of harming yourself?',
  'Do you feel empty or numb?',
  'How often do you cry or feel like crying?',
  'Do you feel disconnected from others?',
  'How is your motivation level?',
  'Do you experience unexplained aches or pains?',
  'Do you feel like a burden to others?',
  'How often do you feel lonely?',
  'Do you have difficulty getting out of bed?',
  'Do you feel like life has no meaning?',
  'How often do you feel tired for no reason?',
  'Do you avoid social activities?',
  'Do you feel unable to enjoy anything?',
  'How is your self-esteem?',
  'Do you experience changes in weight?',
  'Do you feel pessimistic about everything?',
  'How often do you feel emotionally flat?',
  'Do you have difficulty making decisions?',
  'Do you feel like you are going through the motions?',
  'How often do you feel irritable?',
  'Do you experience early morning awakening?',
  'Do you feel like giving up?',
  'How often do you feel indifferent to things that used to matter?',
  'Do you have difficulty remembering things?',
  'Do you feel like you are a failure?',
  'How often do you feel overwhelmed by small tasks?',
  'Do you oversleep or have trouble waking?',
  'Do you feel no one understands you?',
  'How often do you feel like isolating yourself?',
  'Do you experience a lack of pleasure?',
  'Do you feel life is not worth living?',
  'How often do you feel emotionally heavy?',
  'Do you have difficulty completing tasks?',
  'Do you feel like you have let others down?',
  'How often do you feel restless or agitated?',
  'Do you experience excessive sleeping?',
  'Do you feel like there is no point in trying?',
  'How often do you feel disconnected from yourself?',
  'Do you have trouble maintaining relationships?',
  'Do you feel like you deserve to suffer?',
  'How often do you feel emotionally drained?',
  'Do you experience reduced libido?',
  'Do you feel like things will never get better?',
  'How often do you feel like hiding from the world?',
  'Do you have difficulty feeling positive emotions?',
  'Do you feel like you are a disappointment?',
  'How often do you feel like you are in a fog?',
  'Do you experience loss of interest in hobbies?',
  'Do you feel like you have nothing to look forward to?',
  'How often do you feel emotionally fragile?',
  'Do you have trouble taking care of yourself?',
  'Do you feel like you do not belong?',
];

function pickOptions(category) {
  const sets = [OPTIONS, OPTIONS_NEVER, OPTIONS_AGREE, OPTIONS_WELL];
  return sets[Math.floor(Math.random() * sets.length)];
}

function generateQuestions() {
  const questions = [];
  const categories = [
    { name: 'stress', pool: STRESS_QUESTIONS },
    { name: 'anxiety', pool: ANXIETY_QUESTIONS },
    { name: 'depression', pool: DEPRESSION_QUESTIONS },
  ];

  let id = 0;
  const targetPerCategory = 334; // ~1000 total

  for (const cat of categories) {
    for (let i = 0; i < targetPerCategory; i++) {
      const text = cat.pool[i % cat.pool.length];
      const opt = pickOptions(cat.name);
      questions.push({
        questionText: text,
        options: [...opt],
        category: cat.name,
      });
    }
  }

  // Pad to exactly 1000 if needed
  while (questions.length < 1000) {
    const cat = categories[questions.length % 3];
    questions.push({
      questionText: cat.pool[questions.length % cat.pool.length],
      options: OPTIONS,
      category: cat.name,
    });
  }

  return questions.slice(0, 1000);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding questions');

    const existing = await Question.countDocuments();
    if (existing >= 1000) {
      console.log(`Already ${existing} questions exist. Skipping seed.`);
      process.exit(0);
      return;
    }

    if (existing > 0) {
      await Question.deleteMany({});
      console.log('Cleared existing questions');
    }

    const questions = generateQuestions();
    await Question.insertMany(questions);
    console.log(`Created ${questions.length} questions`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seed();
