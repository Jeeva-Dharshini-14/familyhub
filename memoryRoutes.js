const express = require('express');
const { addMemory, getMemories, deleteMemory } = require('./memoryController');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

router.post('/', addMemory);
router.get('/:familyId', getMemories);
router.delete('/:id', deleteMemory);

module.exports = router;