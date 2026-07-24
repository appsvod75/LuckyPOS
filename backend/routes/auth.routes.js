const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login', authController.login);
router.post('/verify-pin', authMiddleware, authController.verifyPin);
router.get('/users', authMiddleware, authController.getUsers);
router.post('/users', authMiddleware, authController.createUser);
router.put('/users/:id', authMiddleware, authController.updateUser);

module.exports = router;
