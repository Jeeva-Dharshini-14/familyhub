const express = require('express');
const router = express.Router();
const {
  getWallets, addWallet, updateWallet, deleteWallet,
  getCategories, addCategory,
  addExpense, getExpenses, deleteExpense,
  addIncome, getIncomes, deleteIncome
} = require('./financeController');

// Wallet routes
router.get('/wallets/:familyId', getWallets);
router.post('/wallets', addWallet);
router.put('/wallets/:walletId', updateWallet);
router.delete('/wallets/:walletId', deleteWallet);

// Category routes
router.get('/categories/:familyId', getCategories);
router.post('/categories', addCategory);

// Expense routes
router.get('/expenses/:familyId', getExpenses);
router.post('/expenses', addExpense);
router.delete('/expenses/:expenseId', deleteExpense);

// Income routes
router.get('/incomes/:familyId', getIncomes);
router.post('/incomes', addIncome);
router.delete('/incomes/:incomeId', deleteIncome);

module.exports = router;