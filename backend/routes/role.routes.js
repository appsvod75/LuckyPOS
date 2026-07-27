const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, roleController.getAllRoles);
router.put('/:id', authMiddleware, roleController.updateRole);

module.exports = router;