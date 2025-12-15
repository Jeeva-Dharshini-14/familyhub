const express = require('express');
const router = express.Router();
const { db } = require('./firebase');

// Get wishlist items
router.get('/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    console.log('Getting wishlist for family:', familyId);
    
    const itemsSnapshot = await db.ref('wishlistItems').orderByChild('familyId').equalTo(familyId).once('value');
    const itemsData = itemsSnapshot.val() || {};
    
    const items = Object.keys(itemsData).map(id => ({
      ...itemsData[id],
      id
    }));
    
    console.log('Found wishlist items:', items.length);
    res.json(items);
  } catch (error) {
    console.error('Error getting wishlist:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add wishlist item
router.post('/', async (req, res) => {
  try {
    console.log('Adding wishlist item:', req.body);
    
    const itemId = db.ref('wishlistItems').push().key;
    const itemData = {
      ...req.body,
      purchased: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`wishlistItems/${itemId}`).set(itemData);
    console.log('Wishlist item saved with ID:', itemId);
    
    res.status(201).json({ ...itemData, id: itemId });
  } catch (error) {
    console.error('Error adding wishlist item:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update wishlist item
router.put('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`wishlistItems/${itemId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`wishlistItems/${itemId}`).once('value');
    res.json({
      id: itemId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Error updating wishlist item:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete wishlist item
router.delete('/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    console.log('Deleting wishlist item:', itemId);
    
    await db.ref(`wishlistItems/${itemId}`).remove();
    console.log('Wishlist item deleted successfully');
    
    res.json({ message: 'Wishlist item deleted successfully' });
  } catch (error) {
    console.error('Error deleting wishlist item:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;