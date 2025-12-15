const express = require('express');
const router = express.Router();
const {
  getFamily,
  createFamily,
  updateFamily,
  deleteFamily
} = require('./familyController');

// Family routes
router.get('/:familyId', getFamily);
router.post('/', createFamily);
router.put('/:familyId', updateFamily);
router.delete('/:familyId', deleteFamily);

module.exports = router;