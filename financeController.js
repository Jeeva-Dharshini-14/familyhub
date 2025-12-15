const { db } = require('./server');

// Wallets
const getWallets = async (req, res) => {
  try {
    const walletsSnapshot = await db.ref('wallets').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const walletsData = walletsSnapshot.val() || {};
    
    const wallets = Object.keys(walletsData).map(id => ({
      ...walletsData[id],
      id
    }));
    
    res.json(wallets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addWallet = async (req, res) => {
  try {
    const walletId = db.ref('wallets').push().key;
    const walletData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    await db.ref(`wallets/${walletId}`).set(walletData);
    res.status(201).json({ ...walletData, id: walletId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWallet = async (req, res) => {
  try {
    await db.ref(`wallets/${req.params.id}`).remove();
    res.json({ message: 'Wallet deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Categories
const getCategories = async (req, res) => {
  try {
    const categoriesSnapshot = await db.ref('categories').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const categoriesData = categoriesSnapshot.val() || {};
    
    const categories = Object.keys(categoriesData).map(id => ({
      ...categoriesData[id],
      id
    }));
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addCategory = async (req, res) => {
  try {
    const categoryId = db.ref('categories').push().key;
    const categoryData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    await db.ref(`categories/${categoryId}`).set(categoryData);
    res.status(201).json({ ...categoryData, id: categoryId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Expenses
const addExpense = async (req, res) => {
  try {
    const expenseId = db.ref('expenses').push().key;
    const expenseData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    // Update wallet balance
    const walletSnapshot = await db.ref(`wallets/${req.body.walletId}`).once('value');
    const wallet = walletSnapshot.val();
    if (wallet) {
      await db.ref(`wallets/${req.body.walletId}/balance`).set(wallet.balance - req.body.amount);
    }
    
    await db.ref(`expenses/${expenseId}`).set(expenseData);
    res.status(201).json({ ...expenseData, id: expenseId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const expensesSnapshot = await db.ref('expenses').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const expensesData = expensesSnapshot.val() || {};
    
    const expenses = Object.keys(expensesData).map(id => ({
      ...expensesData[id],
      id
    }));
    
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expenseSnapshot = await db.ref(`expenses/${req.params.id}`).once('value');
    const expense = expenseSnapshot.val();
    
    if (expense) {
      const walletSnapshot = await db.ref(`wallets/${expense.walletId}`).once('value');
      const wallet = walletSnapshot.val();
      if (wallet) {
        await db.ref(`wallets/${expense.walletId}/balance`).set(wallet.balance + expense.amount);
      }
      await db.ref(`expenses/${req.params.id}`).remove();
    }
    
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Income
const addIncome = async (req, res) => {
  try {
    const incomeId = db.ref('incomes').push().key;
    const incomeData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    // Update wallet balance
    const walletSnapshot = await db.ref(`wallets/${req.body.walletId}`).once('value');
    const wallet = walletSnapshot.val();
    if (wallet) {
      await db.ref(`wallets/${req.body.walletId}/balance`).set(wallet.balance + req.body.amount);
    }
    
    await db.ref(`incomes/${incomeId}`).set(incomeData);
    res.status(201).json({ ...incomeData, id: incomeId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIncomes = async (req, res) => {
  try {
    const incomesSnapshot = await db.ref('incomes').orderByChild('familyId').equalTo(req.params.familyId).once('value');
    const incomesData = incomesSnapshot.val() || {};
    
    const incomes = Object.keys(incomesData).map(id => ({
      ...incomesData[id],
      id
    }));
    
    res.json(incomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteIncome = async (req, res) => {
  try {
    const incomeSnapshot = await db.ref(`incomes/${req.params.id}`).once('value');
    const income = incomeSnapshot.val();
    
    if (income) {
      const walletSnapshot = await db.ref(`wallets/${income.walletId}`).once('value');
      const wallet = walletSnapshot.val();
      if (wallet) {
        await db.ref(`wallets/${income.walletId}/balance`).set(wallet.balance - income.amount);
      }
      await db.ref(`incomes/${req.params.id}`).remove();
    }
    
    res.json({ message: 'Income deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWallets, addWallet, deleteWallet,
  getCategories, addCategory,
  addExpense, getExpenses, deleteExpense,
  addIncome, getIncomes, deleteIncome
};