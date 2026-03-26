const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// --- ROUTES ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/alumni', require('./routes/alumniRoutes'));
app.use('/api/mentors', require('./routes/mentorRoutes'));
app.use('/api/courses', require('./routes/courseRoutes'));
app.use('/api/startups', require('./routes/startupRoutes'));
app.use('/api/meetings', require('./routes/meetingRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/admissions', require('./routes/admissionRoutes'));
app.use('/api/offers', require('./routes/offerRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));

// Static assets for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend in production
const frontendPath = path.join(__dirname, '../dist');
if (require('fs').existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'API Route Not Found' });
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
  });
}

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  // Server started
});
