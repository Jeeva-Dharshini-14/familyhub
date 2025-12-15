const express = require('express');
const router = express.Router();
const { db } = require('./firebase');

// Get trips
router.get('/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    const tripsSnapshot = await db.ref('trips').orderByChild('familyId').equalTo(familyId).once('value');
    const tripsData = tripsSnapshot.val() || {};
    
    const trips = Object.keys(tripsData).map(id => ({
      ...tripsData[id],
      id
    }));
    
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add trip
router.post('/', async (req, res) => {
  try {
    const tripId = db.ref('trips').push().key;
    const tripData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`trips/${tripId}`).set(tripData);
    res.status(201).json({ ...tripData, id: tripId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete trip
router.delete('/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    await db.ref(`trips/${tripId}`).remove();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;