const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, rules } = require('../utils/validate');

router.post('/login', validate(rules.login), authController.login);
router.post('/verify-pin', authMiddleware, validate(rules.verifyPin), authController.verifyPin);
router.get('/users', authMiddleware, authController.getUsers);
router.post('/users', authMiddleware, validate(rules.createUser), authController.createUser);
router.put('/users/:id', authMiddleware, authController.updateUser);
router.delete('/users/:id', authMiddleware, authController.deleteUser);

module.exports = router;
