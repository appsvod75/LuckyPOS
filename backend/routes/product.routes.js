const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory, restoreCategory, getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, restoreProduct, deleteProductPermanent } = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { validate, rules } = require('../utils/validate');

router.get('/categories', authMiddleware, getAllCategories);
router.post('/categories', authMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);
router.patch('/categories/:id/restore', authMiddleware, restoreCategory);

router.get('/', authMiddleware, getAllProducts);
router.get('/:id', authMiddleware, getProductById);
router.post('/', authMiddleware, validate(rules.createProduct), createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.delete('/:id/permanent', authMiddleware, deleteProductPermanent);
router.put('/:id/restore', authMiddleware, restoreProduct);

module.exports = router;
