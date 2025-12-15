const express = require('express');
const router = express.Router();
const {
  getHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment
} = require('./healthController');

// Health Records routes
router.get('/records/:familyId', getHealthRecords);
router.post('/records', addHealthRecord);
router.put('/records/:recordId', updateHealthRecord);
router.delete('/records/:recordId', deleteHealthRecord);

// Appointments routes
router.get('/appointments/:familyId', getAppointments);
router.post('/appointments', addAppointment);
router.put('/appointments/:appointmentId', updateAppointment);
router.delete('/appointments/:appointmentId', deleteAppointment);

module.exports = router;