const express = require('express');
const router = express.Router();
const closingController = require('../controllers/closing.controller');

// Placeholder for auth middleware
const auth = require('../middleware/auth.middleware');

router.get('/', auth, closingController.getClosings);
router.get('/today-summary', auth, closingController.getTodaySummary);
router.post('/force', auth, closingController.forceClosing);
router.get('/details', auth, closingController.getClosingDetails);

module.exports = router;
