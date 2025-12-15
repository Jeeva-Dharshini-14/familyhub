const express = require('express');
const { createFamily, getFamily, updateFamily } = require('./familyController');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

router.post('/', createFamily);
router.get('/:id', getFamily);
router.put('/:id', updateFamily);

module.exports = router;