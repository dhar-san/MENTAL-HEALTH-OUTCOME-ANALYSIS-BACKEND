/**
 * Mental Health Outcome Analytics System - Server
 * Express + MongoDB backend with JWT authentication
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env or create .env from example
const PORT = process.env.PORT || 5000;

connectDB();

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/assessments', require('./routes/assessmentRoutes'));
app.use('/api/responses', require('./routes/responseRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mental Health Analytics API running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
