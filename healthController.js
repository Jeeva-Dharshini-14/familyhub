const { db } = require('./server');

const addHealthRecord = async (req, res) => {
  try {
    const recordId = db.ref('healthRecords').push().key;
    const recordData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    await db.ref(`healthRecords/${recordId}`).set(recordData);
    res.status(201).json({ ...recordData, id: recordId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHealthRecords = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { memberId } = req.query;
    
    const recordsSnapshot = await db.ref('healthRecords').orderByChild('familyId').equalTo(familyId).once('value');
    const recordsData = recordsSnapshot.val() || {};
    
    let records = Object.keys(recordsData).map(id => ({
      ...recordsData[id],
      id
    }));
    
    if (memberId) {
      records = records.filter(record => record.memberId === memberId);
    }
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addHealthRecord, getHealthRecords };