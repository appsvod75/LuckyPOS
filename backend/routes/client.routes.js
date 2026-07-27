const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client.controller');
const verifyToken = require('../middleware/auth.middleware');
const { validate, rules } = require('../utils/validate');

router.use(verifyToken);

router.get('/', clientController.getClients);
router.post('/', validate(rules.createClient), clientController.createClient);
router.put('/:id', validate(rules.updateClient), clientController.updateClient);
router.get('/:id/statement', clientController.getClientStatement);

module.exports = router;
