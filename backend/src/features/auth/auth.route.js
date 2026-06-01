const express = require('express');
const authController = require('./auth.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const multer = require('multer');
const upload = multer();

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/sso', authController.ssoLogin);
router.get('/config', authController.getConfig);

router.get('/me', authMiddleware, authController.getMe);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);
router.put('/password', authMiddleware, authController.updatePassword);

router.get('/users', authMiddleware, requireRole('admin'), authController.getUsers);

module.exports = router;
