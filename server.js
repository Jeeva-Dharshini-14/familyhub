const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebaseServiceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();
console.log('Firebase Admin SDK initialized successfully');
console.log('Connected to Firebase Realtime Database:', process.env.FIREBASE_DATABASE_URL);

// Export db for use in controllers
module.exports = { db };

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

// API Routes
app.use('/api/auth', require('./authRoutes'));
app.use('/api/families', require('./familyRoutes'));
app.use('/api/members', require('./memberRoutes'));
app.use('/api/finance', require('./financeRoutes'));
app.use('/api/tasks', require('./taskRoutes'));
app.use('/api/health', require('./healthRoutes'));
app.use('/api/documents', require('./documentRoutes'));
app.use('/api/calendar', require('./calendarRoutes'));
app.use('/api/memories', require('./memoryRoutes'));
app.use('/api/trips', require('./tripsRoutes'));
app.use('/api/kitchen', require('./kitchenRoutes'));
app.use('/api/study', require('./studyRoutes'));
app.use('/api/notifications', require('./notificationRoutes'));

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