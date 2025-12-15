const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebaseServiceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database structure...');
    
    // Initialize empty collections with proper structure
    const initialStructure = {
      users: {},
      families: {},
      members: {},
      wallets: {},
      categories: {},
      expenses: {},
      incomes: {},
      tasks: {},
      rewards: {},
      redemptions: {},
      memories: {},
      healthRecords: {},
      appointments: {},
      documents: {},
      calendarEvents: {},
      trips: {},
      mealPlans: {},
      pantryItems: {},
      assignments: {},
      notifications: {},
      wishlistItems: {}
    };
    
    // Only initialize if database is completely empty
    const rootSnapshot = await db.ref().once('value');
    if (!rootSnapshot.exists()) {
      console.log('📝 Setting up initial database structure...');
      await db.ref().set(initialStructure);
      console.log('✅ Database structure initialized successfully!');
    } else {
      console.log('ℹ️  Database already exists, skipping initialization.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();