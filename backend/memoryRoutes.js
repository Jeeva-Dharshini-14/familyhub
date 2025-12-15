const express = require('express');
const router = express.Router();
const {
  getMemories,
  addMemory,
  updateMemory,
  deleteMemory
} = require('./memoryController');

// Memory routes
router.get('/:familyId', getMemories);
router.post('/', addMemory);
router.put('/:memoryId', updateMemory);
router.delete('/:memoryId', deleteMemory);

module.exports = router;