const { db } = require('./firebase');

// Get all tasks for a family
const getTasks = async (req, res) => {
  try {
    const { familyId } = req.params;
    const tasksSnapshot = await db.ref('tasks').orderByChild('familyId').equalTo(familyId).once('value');
    const tasksData = tasksSnapshot.val() || {};
    
    const tasks = Object.keys(tasksData).map(id => ({
      ...tasksData[id],
      id
    }));
    
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new task
const addTask = async (req, res) => {
  try {
    const taskId = db.ref('tasks').push().key;
    const taskData = {
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`tasks/${taskId}`).set(taskData);
    res.status(201).json({ ...taskData, id: taskId });
  } catch (error) {
    console.error('Add task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    // Get current task data
    const taskSnapshot = await db.ref(`tasks/${taskId}`).once('value');
    const currentTask = taskSnapshot.val();
    
    if (!currentTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // If task is being approved, award points
    if (updateData.status === 'approved' && currentTask.status !== 'approved' && currentTask.assignedTo) {
      const memberRef = db.ref(`members/${currentTask.assignedTo}`);
      const memberSnapshot = await memberRef.once('value');
      const member = memberSnapshot.val();
      
      if (member) {
        const newPoints = (member.points || 0) + (currentTask.points || 0);
        await memberRef.update({
          points: newPoints,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    await db.ref(`tasks/${taskId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`tasks/${taskId}`).once('value');
    res.json({
      id: taskId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await db.ref(`tasks/${taskId}`).remove();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get rewards for a family
const getRewards = async (req, res) => {
  try {
    const { familyId } = req.params;
    const rewardsSnapshot = await db.ref('rewards').orderByChild('familyId').equalTo(familyId).once('value');
    const rewardsData = rewardsSnapshot.val() || {};
    
    const rewards = Object.keys(rewardsData).map(id => ({
      ...rewardsData[id],
      id
    }));
    
    res.json(rewards);
  } catch (error) {
    console.error('Get rewards error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new reward
const addReward = async (req, res) => {
  try {
    const rewardId = db.ref('rewards').push().key;
    const rewardData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`rewards/${rewardId}`).set(rewardData);
    res.status(201).json({ ...rewardData, id: rewardId });
  } catch (error) {
    console.error('Add reward error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Redeem reward
const redeemReward = async (req, res) => {
  try {
    const { rewardId, memberId } = req.body;
    
    // Get reward and member data
    const rewardSnapshot = await db.ref(`rewards/${rewardId}`).once('value');
    const reward = rewardSnapshot.val();
    
    if (!reward) {
      return res.status(404).json({ message: 'Reward not found' });
    }
    
    const memberSnapshot = await db.ref(`members/${memberId}`).once('value');
    const member = memberSnapshot.val();
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if member has enough points
    const currentPoints = member.points || 0;
    if (currentPoints < reward.pointsCost) {
      return res.status(400).json({ message: 'Insufficient points' });
    }
    
    // Create redemption record
    const redemptionId = db.ref('redemptions').push().key;
    const redemptionData = {
      familyId: reward.familyId,
      memberId,
      rewardId,
      rewardName: reward.name,
      pointsSpent: reward.pointsCost,
      redeemedAt: new Date().toISOString()
    };
    
    // Update member points and create redemption atomically
    const updates = {};
    updates[`members/${memberId}/points`] = currentPoints - reward.pointsCost;
    updates[`members/${memberId}/updatedAt`] = new Date().toISOString();
    updates[`redemptions/${redemptionId}`] = redemptionData;
    
    await db.ref().update(updates);
    
    res.json({ ...redemptionData, id: redemptionId });
  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get redemptions for a family
const getRedemptions = async (req, res) => {
  try {
    const { familyId } = req.params;
    const redemptionsSnapshot = await db.ref('redemptions').orderByChild('familyId').equalTo(familyId).once('value');
    const redemptionsData = redemptionsSnapshot.val() || {};
    
    const redemptions = Object.keys(redemptionsData).map(id => ({
      ...redemptionsData[id],
      id
    }));
    
    res.json(redemptions);
  } catch (error) {
    console.error('Get redemptions error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  getRewards,
  addReward,
  redeemReward,
  getRedemptions
};