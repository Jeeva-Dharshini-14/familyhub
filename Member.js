const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  familyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  dateOfBirth: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer-not-to-say'],
    required: true
  },
  relationship: {
    type: String,
    enum: ['father', 'mother', 'son', 'daughter', 'grandfather', 'grandmother', 'sibling', 'other'],
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'adult', 'teen', 'child', 'guest'],
    required: true
  },
  profileImage: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  permissions: {
    finance: { type: Boolean, default: false },
    health: { type: Boolean, default: true },
    docs: { type: Boolean, default: false },
    study: { type: Boolean, default: true },
    tasks: { type: Boolean, default: true },
    meals: { type: Boolean, default: true },
    trips: { type: Boolean, default: true },
    settings: { type: Boolean, default: false }
  },
  points: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', memberSchema);