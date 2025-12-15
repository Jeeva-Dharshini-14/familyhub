const express = require('express');
const router = express.Router();
const {
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument
} = require('./documentController');

// Document routes
router.get('/:familyId', getDocuments);
router.post('/', uploadDocument);
router.put('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);

module.exports = router;