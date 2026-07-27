const express = require('express');
const router = express.Router();
const branchController = require('../controllers/branch.controller');
const { validate, rules } = require('../utils/validate');

router.get('/', branchController.getAllBranches);
router.post('/', validate(rules.createBranch), branchController.createBranch);
router.put('/:id', branchController.updateBranch);
router.delete('/:id', branchController.deleteBranch);

module.exports = router;
