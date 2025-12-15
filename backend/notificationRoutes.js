const express = require('express');
const router = express.Router();
const { db } = require('./firebase');

// Get notifications for user
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notificationsSnapshot = await db.ref('notifications').orderByChild('userId').equalTo(userId).once('value');
    const notificationsData = notificationsSnapshot.val() || {};
    
    const notifications = Object.keys(notificationsData).map(id => ({
      ...notificationsData[id],
      id
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    await db.ref(`notifications/${notificationId}`).update({
      read: true,
      readAt: new Date().toISOString()
    });
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear all notifications for user
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notificationsSnapshot = await db.ref('notifications').orderByChild('userId').equalTo(userId).once('value');
    const notificationsData = notificationsSnapshot.val() || {};
    
    const updates = {};
    Object.keys(notificationsData).forEach(id => {
      updates[`notifications/${id}`] = null;
    });
    
    await db.ref().update(updates);
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;