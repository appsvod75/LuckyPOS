const express = require('express');
const router = express.Router();
const providerController = require('../controllers/provider.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, rules } = require('../utils/validate');

router.get('/', authMiddleware, providerController.getAllProviders);
router.post('/', authMiddleware, validate(rules.createProvider), providerController.createProvider);
router.put('/:id', authMiddleware, validate(rules.updateProvider), providerController.updateProvider);
router.delete('/:id', authMiddleware, providerController.deleteProvider);

module.exports = router;
