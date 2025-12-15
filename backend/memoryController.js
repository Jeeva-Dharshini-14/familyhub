const { db } = require('./firebase');

// Get all memories for a family
const getMemories = async (req, res) => {
  try {
    const { familyId } = req.params;
    const memoriesSnapshot = await db.ref('memories').orderByChild('familyId').equalTo(familyId).once('value');
    const memoriesData = memoriesSnapshot.val() || {};
    
    const memories = Object.keys(memoriesData).map(id => ({
      ...memoriesData[id],
      id
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(memories);
  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new memory
const addMemory = async (req, res) => {
  try {
    const memoryId = db.ref('memories').push().key;
    const memoryData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`memories/${memoryId}`).set(memoryData);
    res.status(201).json({ ...memoryData, id: memoryId });
  } catch (error) {
    console.error('Add memory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update memory
const updateMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`memories/${memoryId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`memories/${memoryId}`).once('value');
    res.json({
      id: memoryId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update memory error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete memory
const deleteMemory = async (req, res) => {
  try {
    const { memoryId } = req.params;
    await db.ref(`memories/${memoryId}`).remove();
    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Delete memory error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMemories,
  addMemory,
  updateMemory,
  deleteMemory
};