const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const dangerController = require('../controllers/danger.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', configController.getConfig);
router.put('/', authMiddleware, configController.updateConfig);

// Danger Zone Routes
router.post('/danger/reset-sales', authMiddleware, dangerController.resetSales);
router.post('/danger/reset-inventory', authMiddleware, dangerController.resetInventory);
router.post('/danger/reset-products', authMiddleware, dangerController.resetProducts);

module.exports = router;
