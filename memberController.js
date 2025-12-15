const { db } = require('./server');

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
    res.status(201).json({ ...memberData, id: memberId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMembers = async (req, res) => {
  try {
    const membersSnapshot = await db.ref('members').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const membersData = membersSnapshot.val() || {};
    
    const members = Object.keys(membersData).map(id => ({
      ...membersData[id],
      id
    }));
    
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMember = async (req, res) => {
  try {
    const memberSnapshot = await db.ref(`members/${req.params.id}`).once('value');
    const member = memberSnapshot.val();
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json({ ...member, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMember = async (req, res) => {
  try {
    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`members/${req.params.id}`).update(updates);
    
    const memberSnapshot = await db.ref(`members/${req.params.id}`).once('value');
    const member = memberSnapshot.val();
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json({ ...member, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMember = async (req, res) => {
  try {
    await db.ref(`members/${req.params.id}`).remove();
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMemberPoints = async (req, res) => {
  try {
    const memberSnapshot = await db.ref(`members/${req.params.id}`).once('value');
    const member = memberSnapshot.val();
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    res.json(member.points || 0);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addMember, getMembers, getMember, updateMember, deleteMember, getMemberPoints };