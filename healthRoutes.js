const express = require('express');
const { addHealthRecord, getHealthRecords } = require('./healthController');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

router.post('/records', addHealthRecord);
router.get('/records/:familyId', getHealthRecords);

module.exports = router;