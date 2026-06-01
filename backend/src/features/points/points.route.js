const express = require('express');
const pointsController = require('./points.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const multer = require('multer');
const upload = multer();

const router = express.Router();

// Public routes
router.get('/public/map-points', pointsController.getPublic);
router.get('/public/blogs/:id', pointsController.getPublicBlog);

// Points Routes
router.post('/points', authMiddleware, pointsController.create);
router.get('/points/me', authMiddleware, pointsController.getMy);
router.put('/points/:id', authMiddleware, pointsController.update);
router.delete('/points/:id', authMiddleware, pointsController.deletePoint);
router.get('/points', pointsController.getAll);
router.get('/points/pending', authMiddleware, requireRole('admin'), pointsController.getPending);
router.post('/points/:id/verify', authMiddleware, requireRole('admin'), pointsController.verifyPoint);

// Blog Upsert & Get
router.get('/points/:id/blog', pointsController.getBlog);
router.put('/points/:id/blog', authMiddleware, pointsController.upsertBlog);

// Upload Route
router.post('/upload', authMiddleware, upload.single('image'), pointsController.uploadImg);

// Category Routes
router.get('/categories', pointsController.getCategories);
router.post('/categories', authMiddleware, requireRole('admin'), pointsController.createCategory);
router.put('/categories/:id', authMiddleware, requireRole('admin'), pointsController.updateCategory);
router.delete('/categories/:id', authMiddleware, requireRole('admin'), pointsController.deleteCategory);

module.exports = router;
