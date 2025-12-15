const { db } = require('./firebase');

// Get all documents for a family
const getDocuments = async (req, res) => {
  try {
    const { familyId } = req.params;
    const documentsSnapshot = await db.ref('documents').orderByChild('familyId').equalTo(familyId).once('value');
    const documentsData = documentsSnapshot.val() || {};
    
    const documents = Object.keys(documentsData).map(id => ({
      ...documentsData[id],
      id
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Upload new document
const uploadDocument = async (req, res) => {
  try {
    const documentId = db.ref('documents').push().key;
    const documentData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`documents/${documentId}`).set(documentData);
    res.status(201).json({ ...documentData, id: documentId });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update document
const updateDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`documents/${documentId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`documents/${documentId}`).once('value');
    res.json({
      id: documentId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete document
const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    await db.ref(`documents/${documentId}`).remove();
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument
};