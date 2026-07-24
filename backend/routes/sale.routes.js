const express = require('express');
const router = express.Router();
const saleController = require('../controllers/sale.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, saleController.createSale);
router.get('/receivable', authMiddleware, saleController.getAccountsReceivable);
router.get('/history', authMiddleware, saleController.getSalesHistory);
router.put('/:id', authMiddleware, saleController.updateSale);
router.get('/:id', authMiddleware, saleController.getSaleById);

router.post('/:id/pay', authMiddleware, saleController.payAccountReceivable);
router.get('/:id/payments', authMiddleware, saleController.getClientPayments);

module.exports = router;
