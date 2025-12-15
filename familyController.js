const { db } = require('./server');

const createFamily = async (req, res) => {
  try {
    const familyId = db.ref('families').push().key;
    const familyData = {
      ...req.body,
      ownerId: req.user._id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`families/${familyId}`).set(familyData);
    res.status(201).json({ ...familyData, id: familyId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFamily = async (req, res) => {
  try {
    const familySnapshot = await db.ref(`families/${req.params.id}`).once('value');
    const family = familySnapshot.val();
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    res.json({ ...family, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateFamily = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`families/${req.params.id}`).update(updates);
    
    const familySnapshot = await db.ref(`families/${req.params.id}`).once('value');
    const family = familySnapshot.val();
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    res.json({ ...family, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createFamily, getFamily, updateFamily };