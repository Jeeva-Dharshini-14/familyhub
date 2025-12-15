const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('./firebase');

const generateToken = (uid) => {
  return jwt.sign({ uid }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    const users = usersSnapshot.val();
    
    if (!users) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userId = Object.keys(users)[0];
    const user = users[userId];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = generateToken(userId);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      ...userWithoutPassword,
      id: userId,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, familyName } = req.body;

    // Check if user already exists
    const existingUserSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    if (existingUserSnapshot.exists()) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate unique IDs
    const userId = db.ref('users').push().key;
    const familyId = db.ref('families').push().key;
    const memberId = db.ref('members').push().key;
    
    const now = new Date().toISOString();
    
    // Create user data
    const userData = {
      email,
      password: hashedPassword,
      name,
      role: 'owner',
      familyId,
      memberId,
      createdAt: now,
      updatedAt: now
    };

    // Create family data
    const familyData = {
      name: familyName || `${name}'s Family`,
      ownerId: userId,
      avatar: '',
      members: [memberId],
      createdAt: now,
      updatedAt: now
    };
    
    // Create member data
    const memberData = {
      familyId,
      userId,
      name,
      age: 0,
      dateOfBirth: '',
      gender: 'other',
      relationship: 'parent',
      role: 'owner',
      email,
      profileImage: '',
      permissions: {
        finance: true,
        health: true,
        docs: true,
        study: true,
        tasks: true,
        meals: true,
        trips: true,
        settings: true
      },
      points: 0,
      createdAt: now,
      updatedAt: now
    };

    // Create default categories
    const categories = [
      { name: 'Groceries', icon: '🛒', color: '#10b981', budget: 500 },
      { name: 'Utilities', icon: '⚡', color: '#f59e0b', budget: 300 },
      { name: 'Transport', icon: '🚗', color: '#3b82f6', budget: 200 },
      { name: 'Medical', icon: '❤️', color: '#ef4444', budget: 400 },
      { name: 'Education', icon: '📚', color: '#8b5cf6', budget: 300 },
      { name: 'Entertainment', icon: '🎬', color: '#ec4899', budget: 250 },
      { name: 'Dining Out', icon: '🍽️', color: '#f97316', budget: 300 },
      { name: 'Salary', icon: '💰', color: '#10b981', budget: 0 },
      { name: 'Freelance', icon: '💻', color: '#3b82f6', budget: 0 }
    ];

    // Save all data to Firebase
    const updates = {};
    updates[`users/${userId}`] = userData;
    updates[`families/${familyId}`] = familyData;
    updates[`members/${memberId}`] = memberData;
    
    // Add default categories
    categories.forEach(cat => {
      const catId = db.ref('categories').push().key;
      updates[`categories/${catId}`] = {
        ...cat,
        familyId,
        createdAt: now
      };
    });

    await db.ref().update(updates);

    // Generate token
    const token = generateToken(userId);
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = userData;
    
    res.status(201).json({
      ...userWithoutPassword,
      id: userId,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, register };