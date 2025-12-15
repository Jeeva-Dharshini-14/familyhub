const express = require('express');
const router = express.Router();
const { db } = require('./firebase');

// Get assignments
router.get('/assignments/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    const assignmentsSnapshot = await db.ref('assignments').orderByChild('familyId').equalTo(familyId).once('value');
    const assignmentsData = assignmentsSnapshot.val() || {};
    
    const assignments = Object.keys(assignmentsData).map(id => ({
      ...assignmentsData[id],
      id
    }));
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add assignment
router.post('/assignments', async (req, res) => {
  try {
    const assignmentId = db.ref('assignments').push().key;
    const assignmentData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`assignments/${assignmentId}`).set(assignmentData);
    res.status(201).json({ ...assignmentData, id: assignmentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update assignment
router.put('/assignments/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`assignments/${assignmentId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`assignments/${assignmentId}`).once('value');
    res.json({
      id: assignmentId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete assignment
router.delete('/assignments/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    await db.ref(`assignments/${assignmentId}`).remove();
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;