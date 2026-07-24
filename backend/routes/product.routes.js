const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory, updateCategory, deleteCategory, restoreCategory, getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, restoreProduct, deleteProductPermanent } = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/categories', getAllCategories);
router.post('/categories', authMiddleware, createCategory);
router.put('/categories/:id', authMiddleware, updateCategory);
router.delete('/categories/:id', authMiddleware, deleteCategory);
router.patch('/categories/:id/restore', authMiddleware, restoreCategory);

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authMiddleware, createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);
router.delete('/:id/permanent', authMiddleware, deleteProductPermanent);
router.put('/:id/restore', authMiddleware, restoreProduct);

module.exports = router;
