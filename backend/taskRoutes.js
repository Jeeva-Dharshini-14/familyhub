const express = require('express');
const router = express.Router();
const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getRewards,
  addReward,
  redeemReward,
  getRedemptions
} = require('./taskController');

// Task routes
router.get('/:familyId', getTasks);
router.post('/', addTask);
router.put('/:taskId', updateTask);
router.delete('/:taskId', deleteTask);

// Reward routes
router.get('/rewards/:familyId', getRewards);
router.post('/rewards', addReward);
router.post('/redeem', redeemReward);
router.get('/redemptions/:familyId', getRedemptions);

module.exports = router;