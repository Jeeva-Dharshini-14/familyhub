const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('./server');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usersSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    const users = usersSnapshot.val();
    
    if (!users) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userId = Object.keys(users)[0];
    const user = users[userId];
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(userId);
    
    res.json({
      ...user,
      token,
      id: userId,
      familyId: user.familyId,
      memberId: user.memberId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const register = async (req, res) => {
  try {
    const { email, password, name, familyName } = req.body;

    const existingUserSnapshot = await db.ref('users').orderByChild('email').equalTo(email).once('value');
    if (existingUserSnapshot.exists()) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = db.ref('users').push().key;
    
    const userData = {
      email,
      password: hashedPassword,
      name,
      role: 'adult',
      createdAt: new Date().toISOString()
    };

    if (familyName) {
      const familyId = db.ref('families').push().key;
      const memberId = db.ref('members').push().key;
      
      const familyData = {
        name: familyName,
        ownerId: userId,
        avatar: '',
        members: [memberId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const memberData = {
        familyId,
        name,
        age: 0,
        dateOfBirth: '',
        gender: 'other',
        relationship: 'other',
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      userData.familyId = familyId;
      userData.memberId = memberId;
      userData.role = 'owner';
      
      await db.ref(`families/${familyId}`).set(familyData);
      await db.ref(`members/${memberId}`).set(memberData);
    }

    await db.ref(`users/${userId}`).set(userData);

    const token = generateToken(userId);
    res.status(201).json({
      ...userData,
      token,
      id: userId
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, register };