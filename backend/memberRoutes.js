const express = require('express');
const router = express.Router();
const {
  getMembers,
  getMember,
  addMember,
  updateMember,
  deleteMember,
  getMemberPoints,
  updateMemberPoints
} = require('./memberController');

// Member CRUD routes
router.get('/family/:familyId', getMembers);
router.get('/:memberId', getMember);
router.post('/', addMember);
router.put('/:memberId', updateMember);
router.delete('/:memberId', deleteMember);

// Points routes
router.get('/points/:memberId', getMemberPoints);
router.put('/points/:memberId', updateMemberPoints);

module.exports = router;