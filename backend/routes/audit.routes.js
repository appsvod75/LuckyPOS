const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, auditController.getAllLogs);

module.exports = router;
