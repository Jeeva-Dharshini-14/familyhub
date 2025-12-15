const express = require('express');
const router = express.Router();
const { db } = require('./firebase');

// Get calendar events
router.get('/events/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    const eventsSnapshot = await db.ref('calendarEvents').orderByChild('familyId').equalTo(familyId).once('value');
    const eventsData = eventsSnapshot.val() || {};
    
    const events = Object.keys(eventsData).map(id => ({
      ...eventsData[id],
      id
    }));
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add calendar event
router.post('/events', async (req, res) => {
  try {
    const eventId = db.ref('calendarEvents').push().key;
    const eventData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`calendarEvents/${eventId}`).set(eventData);
    res.status(201).json({ ...eventData, id: eventId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update calendar event
router.put('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`calendarEvents/${eventId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`calendarEvents/${eventId}`).once('value');
    res.json({
      id: eventId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete calendar event
router.delete('/events/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    await db.ref(`calendarEvents/${eventId}`).remove();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;