const express = require('express');
const router = express.Router();
const { db } = require('./firebase');

// Meal Plans
router.get('/meals/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    const mealsSnapshot = await db.ref('mealPlans').orderByChild('familyId').equalTo(familyId).once('value');
    const mealsData = mealsSnapshot.val() || {};
    
    const meals = Object.keys(mealsData).map(id => ({
      ...mealsData[id],
      id
    }));
    
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/meals', async (req, res) => {
  try {
    const mealId = db.ref('mealPlans').push().key;
    const mealData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`mealPlans/${mealId}`).set(mealData);
    res.status(201).json({ ...mealData, id: mealId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/meals/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params;
    await db.ref(`mealPlans/${mealId}`).remove();
    res.json({ message: 'Meal plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Pantry Items
router.get('/pantry/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    const pantrySnapshot = await db.ref('pantryItems').orderByChild('familyId').equalTo(familyId).once('value');
    const pantryData = pantrySnapshot.val() || {};
    
    const items = Object.keys(pantryData).map(id => ({
      ...pantryData[id],
      id
    }));
    
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/pantry', async (req, res) => {
  try {
    const itemId = db.ref('pantryItems').push().key;
    const itemData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`pantryItems/${itemId}`).set(itemData);
    res.status(201).json({ ...itemData, id: itemId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/pantry/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    await db.ref(`pantryItems/${itemId}`).remove();
    res.json({ message: 'Pantry item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;