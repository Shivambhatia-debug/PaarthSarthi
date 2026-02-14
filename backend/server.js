const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS – allow production domains and env list
const allowedOrigins = [
  'http://localhost:3000',
  'https://paarthsarthi.com',
  'https://www.paarthsarthi.com',
  'https://paarthsarthi.netlify.app',
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',').map(s => s.trim()).filter(Boolean) : [])
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static folder for uploads – serve only if file exists (avoids ENOENT on Vercel where uploads aren't persisted)
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', (req, res, next) => {
  const filePath = path.join(uploadsDir, req.path);
  if (!filePath.startsWith(uploadsDir)) return res.status(404).end();
  fs.stat(filePath, (err, stat) => {
    if (err || !stat || !stat.isFile()) return res.status(404).end();
    res.sendFile(filePath, (err2) => {
      if (err2 && err2.code === 'ENOENT') return res.status(404).end();
      if (err2) return next(err2);
    });
  });
});

// ============ API Routes ============

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Alumni routes
app.use('/api/alumni', require('./routes/alumni'));

// Admission routes
app.use('/api/admissions', require('./routes/admissions'));

// Mentor routes
app.use('/api/mentors', require('./routes/mentors'));

// Course routes
app.use('/api/courses', require('./routes/courses'));

// Startup routes
app.use('/api/startups', require('./routes/startups'));

// Blog routes
app.use('/api/blogs', require('./routes/blogs'));

// Meeting/Booking routes
app.use('/api/meetings', require('./routes/meetings'));

// Notification routes
app.use('/api/notifications', require('./routes/notifications'));

// Admin routes
app.use('/api/admin', require('./routes/admin'));

// Contact/Callback routes
app.use('/api/contact', require('./routes/contact'));

// Offers (slideshow) – public GET /api/offers, admin CRUD via /api/offers
app.use('/api/offers', require('./routes/offers'));

// Settings (ticker etc.)
app.use('/api/settings', require('./routes/settings'));

// ============ Root (for Vercel / deployment sanity) ============
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ParthSarthi API',
    docs: 'Use /api/* for endpoints. Health: /api/health',
    health: '/api/health'
  });
});

app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'ParthSarthi API',
    endpoints: { health: '/api/health', auth: '/api/auth', alumni: '/api/alumni', mentors: '/api/mentors', courses: '/api/courses', startups: '/api/startups', meetings: '/api/meetings', contact: '/api/contact' }
  });
});

// ============ Health Check (includes DB status) ============
const readyStateMap = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const database = readyStateMap[state] ?? 'unknown';
  const dbConnected = state === 1;
  res.json({
    success: true,
    message: 'ParthSarthi API is running',
    timestamp: new Date().toISOString(),
    database: {
      status: database,
      connected: dbConnected
    }
  });
});

// ============ Error Handler ============
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

// Only listen when not on Vercel (serverless)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`
  =========================================
    ParthSarthi API Server
    Mode: ${process.env.NODE_ENV}
    Port: ${PORT}
    URL: http://localhost:${PORT}
  =========================================
  `);
  });
}

module.exports = app;
