const { db } = require('./server');

const addTask = async (req, res) => {
  try {
    const taskId = db.ref('tasks').push().key;
    const taskData = {
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    await db.ref(`tasks/${taskId}`).set(taskData);
    res.status(201).json({ ...taskData, id: taskId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasksSnapshot = await db.ref('tasks').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const tasksData = tasksSnapshot.val() || {};
    
    const tasks = Object.keys(tasksData).map(id => ({
      ...tasksData[id],
      id
    }));
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    await db.ref(`tasks/${req.params.id}`).update(req.body);
    
    const taskSnapshot = await db.ref(`tasks/${req.params.id}`).once('value');
    const task = taskSnapshot.val();
    
    // Award points if approved
    if (req.body.status === 'approved' && task.assignedTo && task.points) {
      const memberSnapshot = await db.ref(`members/${task.assignedTo}`).once('value');
      const member = memberSnapshot.val();
      if (member) {
        await db.ref(`members/${task.assignedTo}/points`).set((member.points || 0) + task.points);
      }
    }
    
    res.json({ ...task, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { addTask, getTasks, updateTask };