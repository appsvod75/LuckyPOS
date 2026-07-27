const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, backupController.runBackup);
router.get('/', authMiddleware, backupController.getBackups);
router.delete('/:filename', authMiddleware, backupController.deleteBackup);
router.get('/:filename/download', authMiddleware, backupController.downloadBackup);

module.exports = router;