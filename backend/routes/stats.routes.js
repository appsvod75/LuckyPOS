const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

// Simple auth middleware for now
const auth = (req, res, next) => {
    req.user = { id: 1 };
    next();
};

router.get('/dashboard', auth, statsController.getDashboardStats);
router.get('/reports', auth, statsController.getReports);

module.exports = router;
