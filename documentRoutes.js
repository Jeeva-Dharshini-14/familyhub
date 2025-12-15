const express = require('express');
const { uploadDocument, getDocuments, deleteDocument } = require('./documentController');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

router.post('/', uploadDocument);
router.get('/:familyId', getDocuments);
router.delete('/:id', deleteDocument);

module.exports = router;