const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const initializeSocket = require('./config/socket');
const { errorHandler } = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize socket event handlers
initializeSocket(io);

// Make io accessible in controllers if needed
app.set('io', io);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// --- ROUTES ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/alumni', require('./routes/alumni'));
app.use('/api/mentors', require('./routes/mentors'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/startups', require('./routes/startups'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/offers', require('./routes/offers'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/community', require('./routes/community'));

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time chat`);
});
