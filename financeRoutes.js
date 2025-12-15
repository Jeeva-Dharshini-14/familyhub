const express = require('express');
const {
  getWallets, addWallet, deleteWallet,
  getCategories, addCategory,
  addExpense, getExpenses, deleteExpense,
  addIncome, getIncomes, deleteIncome
} = require('./financeController');
const auth = require('./auth');

const router = express.Router();

router.use(auth);

// Wallets
router.get('/wallets/:familyId', getWallets);
router.post('/wallets', addWallet);
router.delete('/wallets/:id', deleteWallet);

// Categories
router.get('/categories/:familyId', getCategories);
router.post('/categories', addCategory);

// Expenses
router.post('/expenses', addExpense);
router.get('/expenses/:familyId', getExpenses);
router.delete('/expenses/:id', deleteExpense);

// Income
router.post('/incomes', addIncome);
router.get('/incomes/:familyId', getIncomes);
router.delete('/incomes/:id', deleteIncome);

module.exports = router;