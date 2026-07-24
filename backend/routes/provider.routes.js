const express = require('express');
const router = express.Router();
const providerController = require('../controllers/provider.controller');

router.get('/', providerController.getAllProviders);
router.post('/', providerController.createProvider);

module.exports = router;
