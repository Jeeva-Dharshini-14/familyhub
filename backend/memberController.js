const { db } = require('./firebase');

// Get all members for a family
const getMembers = async (req, res) => {
  try {
    const { familyId } = req.params;
    const membersSnapshot = await db.ref('members').orderByChild('familyId').equalTo(familyId).once('value');
    const membersData = membersSnapshot.val() || {};
    
    const members = Object.keys(membersData).map(id => ({
      ...membersData[id],
      id
    }));
    
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get single member
const getMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const memberSnapshot = await db.ref(`members/${memberId}`).once('value');
    const member = memberSnapshot.val();
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json({
      id: memberId,
      ...member
    });
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add new member
const addMember = async (req, res) => {
  try {
    const memberId = db.ref('members').push().key;
    const memberData = {
      ...req.body,
      points: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`members/${memberId}`).set(memberData);
    
    // Update family members list
    if (memberData.familyId) {
      const familyRef = db.ref(`families/${memberData.familyId}`);
      const familySnapshot = await familyRef.once('value');
      const family = familySnapshot.val();
      
      if (family) {
        const updatedMembers = [...(family.members || []), memberId];
        await familyRef.update({
          members: updatedMembers,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    res.status(201).json({ ...memberData, id: memberId });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update member
const updateMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`members/${memberId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`members/${memberId}`).once('value');
    res.json({
      id: memberId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete member
const deleteMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    
    // Get member data first
    const memberSnapshot = await db.ref(`members/${memberId}`).once('value');
    const member = memberSnapshot.val();
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Remove from family members list
    if (member.familyId) {
      const familyRef = db.ref(`families/${member.familyId}`);
      const familySnapshot = await familyRef.once('value');
      const family = familySnapshot.val();
      
      if (family && family.members) {
        const updatedMembers = family.members.filter(id => id !== memberId);
        await familyRef.update({
          members: updatedMembers,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    // Delete member
    await db.ref(`members/${memberId}`).remove();
    
    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get member points
const getMemberPoints = async (req, res) => {
  try {
    const { memberId } = req.params;
    const memberSnapshot = await db.ref(`members/${memberId}`).once('value');
    const member = memberSnapshot.val();
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json({ points: member.points || 0 });
  } catch (error) {
    console.error('Get member points error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update member points
const updateMemberPoints = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { points } = req.body;
    
    await db.ref(`members/${memberId}`).update({
      points: points,
      updatedAt: new Date().toISOString()
    });
    
    res.json({ points });
  } catch (error) {
    console.error('Update member points error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMembers,
  getMember,
  addMember,
  updateMember,
  deleteMember,
  getMemberPoints,
  updateMemberPoints
};