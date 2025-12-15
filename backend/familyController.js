const { db } = require('./firebase');

// Get family by ID
const getFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    const familySnapshot = await db.ref(`families/${familyId}`).once('value');
    const family = familySnapshot.val();
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    res.json({
      id: familyId,
      ...family
    });
  } catch (error) {
    console.error('Get family error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new family
const createFamily = async (req, res) => {
  try {
    const familyId = db.ref('families').push().key;
    const familyData = {
      ...req.body,
      members: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`families/${familyId}`).set(familyData);
    res.status(201).json({ ...familyData, id: familyId });
  } catch (error) {
    console.error('Create family error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update family
const updateFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`families/${familyId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`families/${familyId}`).once('value');
    res.json({
      id: familyId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update family error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete family
const deleteFamily = async (req, res) => {
  try {
    const { familyId } = req.params;
    
    // Get family data first to clean up related data
    const familySnapshot = await db.ref(`families/${familyId}`).once('value');
    const family = familySnapshot.val();
    
    if (!family) {
      return res.status(404).json({ message: 'Family not found' });
    }
    
    // Delete all related data
    const updates = {};
    updates[`families/${familyId}`] = null;
    
    // Delete all members
    if (family.members && family.members.length > 0) {
      family.members.forEach(memberId => {
        updates[`members/${memberId}`] = null;
      });
    }
    
    // Delete family-related data
    const collections = ['wallets', 'categories', 'expenses', 'incomes', 'tasks', 'rewards', 'memories', 'healthRecords', 'documents'];
    
    for (const collection of collections) {
      const snapshot = await db.ref(collection).orderByChild('familyId').equalTo(familyId).once('value');
      const data = snapshot.val() || {};
      Object.keys(data).forEach(id => {
        updates[`${collection}/${id}`] = null;
      });
    }
    
    await db.ref().update(updates);
    
    res.json({ message: 'Family and all related data deleted successfully' });
  } catch (error) {
    console.error('Delete family error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFamily,
  createFamily,
  updateFamily,
  deleteFamily
};