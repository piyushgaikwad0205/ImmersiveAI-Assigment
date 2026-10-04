const { Router } = require('express');
const authController = require('./auth.controller');
const { authenticate } = require('./auth.middleware');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getProfile);

module.exports = router;
