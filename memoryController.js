const { db } = require('./server');

const addMemory = async (req, res) => {
  try {
    const memoryId = db.ref('memories').push().key;
    const memoryData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    await db.ref(`memories/${memoryId}`).set(memoryData);
    res.status(201).json({ ...memoryData, id: memoryId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMemories = async (req, res) => {
  try {
    const memoriesSnapshot = await db.ref('memories').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const memoriesData = memoriesSnapshot.val() || {};
    
    const memories = Object.keys(memoriesData).map(id => ({
      ...memoriesData[id],
      id
    }));
    
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMemory = async (req, res) => {
  try {
    await db.ref(`memories/${req.params.id}`).remove();
    res.json({ message: 'Memory deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addMemory, getMemories, deleteMemory };