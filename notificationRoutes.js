const express = require('express');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

// Placeholder routes - implement based on mockApi notification functions
router.get('/:userId', (req, res) => res.json([]));
router.post('/', (req, res) => res.json({ message: 'Notification created' }));

module.exports = router;