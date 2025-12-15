const { db } = require('./firebase');

// Wallets
const getWallets = async (req, res) => {
  try {
    const { familyId } = req.params;
    const walletsSnapshot = await db.ref('wallets').orderByChild('familyId').equalTo(familyId).once('value');
    const walletsData = walletsSnapshot.val() || {};
    
    const wallets = Object.keys(walletsData).map(id => ({
      ...walletsData[id],
      id
    }));
    
    res.json(wallets);
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({ message: error.message });
  }
};

const addWallet = async (req, res) => {
  try {
    const walletId = db.ref('wallets').push().key;
    const walletData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`wallets/${walletId}`).set(walletData);
    res.status(201).json({ ...walletData, id: walletId });
  } catch (error) {
    console.error('Add wallet error:', error);
    res.status(500).json({ message: error.message });
  }
};

const updateWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`wallets/${walletId}`).update(updateData);
    
    const updatedSnapshot = await db.ref(`wallets/${walletId}`).once('value');
    res.json({
      id: walletId,
      ...updatedSnapshot.val()
    });
  } catch (error) {
    console.error('Update wallet error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteWallet = async (req, res) => {
  try {
    const { walletId } = req.params;
    await db.ref(`wallets/${walletId}`).remove();
    res.json({ message: 'Wallet deleted successfully' });
  } catch (error) {
    console.error('Delete wallet error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Categories
const getCategories = async (req, res) => {
  try {
    const { familyId } = req.params;
    const categoriesSnapshot = await db.ref('categories').orderByChild('familyId').equalTo(familyId).once('value');
    const categoriesData = categoriesSnapshot.val() || {};
    
    const categories = Object.keys(categoriesData).map(id => ({
      ...categoriesData[id],
      id
    }));
    
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const categoryId = db.ref('categories').push().key;
    const categoryData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.ref(`categories/${categoryId}`).set(categoryData);
    res.status(201).json({ ...categoryData, id: categoryId });
  } catch (error) {
    console.error('Add category error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Expenses
const addExpense = async (req, res) => {
  try {
    const expenseId = db.ref('expenses').push().key;
    const expenseData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update wallet balance atomically
    const walletRef = db.ref(`wallets/${req.body.walletId}`);
    const walletSnapshot = await walletRef.once('value');
    const wallet = walletSnapshot.val();
    
    if (wallet) {
      const updates = {};
      updates[`expenses/${expenseId}`] = expenseData;
      updates[`wallets/${req.body.walletId}/balance`] = wallet.balance - req.body.amount;
      updates[`wallets/${req.body.walletId}/updatedAt`] = new Date().toISOString();
      
      await db.ref().update(updates);
    } else {
      await db.ref(`expenses/${expenseId}`).set(expenseData);
    }
    
    res.status(201).json({ ...expenseData, id: expenseId });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const { familyId } = req.params;
    const expensesSnapshot = await db.ref('expenses').orderByChild('familyId').equalTo(familyId).once('value');
    const expensesData = expensesSnapshot.val() || {};
    
    const expenses = Object.keys(expensesData).map(id => ({
      ...expensesData[id],
      id
    }));
    
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expenseSnapshot = await db.ref(`expenses/${expenseId}`).once('value');
    const expense = expenseSnapshot.val();
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Restore wallet balance atomically
    const walletSnapshot = await db.ref(`wallets/${expense.walletId}`).once('value');
    const wallet = walletSnapshot.val();
    
    if (wallet) {
      const updates = {};
      updates[`expenses/${expenseId}`] = null; // Delete expense
      updates[`wallets/${expense.walletId}/balance`] = wallet.balance + expense.amount;
      updates[`wallets/${expense.walletId}/updatedAt`] = new Date().toISOString();
      
      await db.ref().update(updates);
    } else {
      await db.ref(`expenses/${expenseId}`).remove();
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Income
const addIncome = async (req, res) => {
  try {
    const incomeId = db.ref('incomes').push().key;
    const incomeData = {
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update wallet balance atomically
    const walletRef = db.ref(`wallets/${req.body.walletId}`);
    const walletSnapshot = await walletRef.once('value');
    const wallet = walletSnapshot.val();
    
    if (wallet) {
      const updates = {};
      updates[`incomes/${incomeId}`] = incomeData;
      updates[`wallets/${req.body.walletId}/balance`] = wallet.balance + req.body.amount;
      updates[`wallets/${req.body.walletId}/updatedAt`] = new Date().toISOString();
      
      await db.ref().update(updates);
    } else {
      await db.ref(`incomes/${incomeId}`).set(incomeData);
    }
    
    res.status(201).json({ ...incomeData, id: incomeId });
  } catch (error) {
    console.error('Add income error:', error);
    res.status(500).json({ message: error.message });
  }
};

const getIncomes = async (req, res) => {
  try {
    const { familyId } = req.params;
    const incomesSnapshot = await db.ref('incomes').orderByChild('familyId').equalTo(familyId).once('value');
    const incomesData = incomesSnapshot.val() || {};
    
    const incomes = Object.keys(incomesData).map(id => ({
      ...incomesData[id],
      id
    }));
    
    res.json(incomes);
  } catch (error) {
    console.error('Get incomes error:', error);
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const { incomeId } = req.params;
    const incomeSnapshot = await db.ref(`incomes/${incomeId}`).once('value');
    const income = incomeSnapshot.val();
    
    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }
    
    // Restore wallet balance atomically
    const walletSnapshot = await db.ref(`wallets/${income.walletId}`).once('value');
    const wallet = walletSnapshot.val();
    
    if (wallet) {
      const updates = {};
      updates[`incomes/${incomeId}`] = null; // Delete income
      updates[`wallets/${income.walletId}/balance`] = wallet.balance - income.amount;
      updates[`wallets/${income.walletId}/updatedAt`] = new Date().toISOString();
      
      await db.ref().update(updates);
    } else {
      await db.ref(`incomes/${incomeId}`).remove();
    }
    
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Delete income error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWallets, addWallet, updateWallet, deleteWallet,
  getCategories, addCategory,
  addExpense, getExpenses, deleteExpense,
  addIncome, getIncomes, deleteIncome
};