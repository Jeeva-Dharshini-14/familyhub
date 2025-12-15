const express = require('express');
const { addMember, getMembers, getMember, updateMember, deleteMember, getMemberPoints } = require('./memberController');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

router.post('/', addMember);
router.get('/family/:familyId', getMembers);
router.get('/:id', getMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);
router.get('/:id/points', getMemberPoints);

module.exports = router;