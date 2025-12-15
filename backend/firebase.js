const admin = require('firebase-admin');
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

module.exports = { db };