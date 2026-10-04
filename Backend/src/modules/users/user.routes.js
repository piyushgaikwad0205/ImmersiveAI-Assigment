const { Router } = require('express');
const userController = require('./user.controller');
const { optionalAuth } = require('../auth/auth.middleware');

const router = Router();

router.get('/', optionalAuth, userController.getAllUsers);
router.get('/:id', optionalAuth, userController.getUserById);

module.exports = router;
