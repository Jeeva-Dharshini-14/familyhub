const { db } = require('./server');

const uploadDocument = async (req, res) => {
  try {
    const documentId = db.ref('documents').push().key;
    const documentData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    await db.ref(`documents/${documentId}`).set(documentData);
    res.status(201).json({ ...documentData, id: documentId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDocuments = async (req, res) => {
  try {
    const documentsSnapshot = await db.ref('documents').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const documentsData = documentsSnapshot.val() || {};
    
    const documents = Object.keys(documentsData).map(id => ({
      ...documentsData[id],
      id
    }));
    
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDocument = async (req, res) => {
  try {
    await db.ref(`documents/${req.params.id}`).remove();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };