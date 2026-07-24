const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.get('/medical-info/:product_id', aiController.getMedicalInfo);
router.post('/generate-medical', aiController.generateMedicalInfo);

module.exports = router;
