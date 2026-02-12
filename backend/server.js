const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Enable CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ============ API Routes ============

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Alumni routes
app.use('/api/alumni', require('./routes/alumni'));

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

// ============ Health Check ============
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'ParthSarthi API is running',
    timestamp: new Date().toISOString()
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

module.exports = app;
