const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, rules } = require('../utils/validate');

router.use(authMiddleware);

router.post('/', validate(rules.createPurchase), purchaseController.createPurchase);
router.get('/', purchaseController.getAllPurchases);
router.get('/payable', purchaseController.getAccountsPayable);
router.post('/:id/pay', validate(rules.payAccount), purchaseController.payPurchase);
router.post('/:id/mark-paid', purchaseController.markAsPaid);
router.get('/:id', purchaseController.getPurchaseById);

module.exports = router;
