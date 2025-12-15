const { db } = require('./firebase');

// Health Records
const getHealthRecords = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { memberId } = req.query;
    
    let query = db.ref('healthRecords').orderByChild('familyId').equalTo(familyId);
    const recordsSnapshot = await query.once('value');
    const recordsData = recordsSnapshot.val() || {};
    
    let records = Object.keys(recordsData).map(id => ({
      ...recordsData[id],
      id
    }));
    
    // Filter by member if specified
    if (memberId) {
      records = records.filter(record => record.memberId === memberId);
    }
    
    // Sort by date (newest first)
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json(records);
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ message: error.message });
  }
};

const addHealthRecord = async (req, res) => {
  try {
    const recordId = db.ref('healthRecords').push().key;
    const recordData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`healthRecords/${recordId}`).set(recordData);
    res.status(201).json({ ...recordData, id: recordId });
  } catch (error) {
    console.error('Add health record error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`healthRecords/${recordId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`healthRecords/${recordId}`).once('value');
    res.json({
      id: recordId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update health record error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteHealthRecord = async (req, res) => {
  try {
    const { recordId } = req.params;
    await db.ref(`healthRecords/${recordId}`).remove();
    res.json({ message: 'Health record deleted successfully' });
  } catch (error) {
    console.error('Delete health record error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Appointments
const getAppointments = async (req, res) => {
  try {
    const { familyId } = req.params;
    const { memberId } = req.query;
    
    let query = db.ref('appointments').orderByChild('familyId').equalTo(familyId);
    const appointmentsSnapshot = await query.once('value');
    const appointmentsData = appointmentsSnapshot.val() || {};
    
    let appointments = Object.keys(appointmentsData).map(id => ({
      ...appointmentsData[id],
      id
    }));
    
    // Filter by member if specified
    if (memberId) {
      appointments = appointments.filter(appointment => appointment.memberId === memberId);
    }
    
    // Sort by date (newest first)
    appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    res.json(appointments);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: error.message });
  }
};

const addAppointment = async (req, res) => {
  try {
    const appointmentId = db.ref('appointments').push().key;
    const appointmentData = {
      ...req.body,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`appointments/${appointmentId}`).set(appointmentData);
    res.status(201).json({ ...appointmentData, id: appointmentId });
  } catch (error) {
    console.error('Add appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`appointments/${appointmentId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`appointments/${appointmentId}`).once('value');
    res.json({
      id: appointmentId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    await db.ref(`appointments/${appointmentId}`).remove();
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getHealthRecords,
  addHealthRecord,
  updateHealthRecord,
  deleteHealthRecord,
  getAppointments,
  addAppointment,
  updateAppointment,
  deleteAppointment
};