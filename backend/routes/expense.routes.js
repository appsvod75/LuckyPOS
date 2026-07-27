const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, rules } = require('../utils/validate');

router.post('/', authMiddleware, validate(rules.registerExpense), expenseController.registerExpense);
router.get('/daily', authMiddleware, expenseController.getDailyExpenses);
router.put('/:id', authMiddleware, expenseController.updateExpense);
router.delete('/:id', authMiddleware, expenseController.deleteExpense);

module.exports = router;
