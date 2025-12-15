const express = require('express');
const { addTask, getTasks, updateTask } = require('./taskController');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

router.post('/', addTask);
router.get('/:familyId', getTasks);
router.put('/:id', updateTask);

module.exports = router;