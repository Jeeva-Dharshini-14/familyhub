const express = require('express');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

// Placeholder routes - implement based on mockApi trips functions
router.get('/:familyId', (req, res) => res.json([]));
router.post('/', (req, res) => res.json({ message: 'Trip created' }));

module.exports = router;