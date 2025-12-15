const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase first
require('./firebase');

const { authenticateToken, optionalAuth } = require('./auth');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Backend running with Firebase Realtime Database!' });
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

// Debug wishlist route (no auth)
app.get('/api/wishlist-test', (req, res) => {
  res.json({ message: 'Wishlist route is working!', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./authRoutes'));
app.use('/api/families', authenticateToken, require('./familyRoutes'));
app.use('/api/members', authenticateToken, require('./memberRoutes'));
app.use('/api/finance', authenticateToken, require('./financeRoutes'));
app.use('/api/tasks', authenticateToken, require('./taskRoutes'));
app.use('/api/health', authenticateToken, require('./healthRoutes'));
app.use('/api/documents', authenticateToken, require('./documentRoutes'));
app.use('/api/calendar', authenticateToken, require('./calendarRoutes'));
app.use('/api/memories', authenticateToken, require('./memoryRoutes'));
app.use('/api/trips', authenticateToken, require('./tripsRoutes'));
app.use('/api/kitchen', authenticateToken, require('./kitchenRoutes'));
app.use('/api/study', authenticateToken, require('./studyRoutes'));
app.use('/api/notifications', authenticateToken, require('./notificationRoutes'));
app.use('/api/wishlist', authenticateToken, require('./wishlistRoutes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Root endpoint: http://localhost:${PORT}`);
  console.log(`API endpoints: http://localhost:${PORT}/api/`);
});