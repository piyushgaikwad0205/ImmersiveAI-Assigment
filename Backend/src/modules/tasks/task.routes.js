const { Router } = require('express');
const taskController = require('./task.controller');
const { optionalAuth } = require('../auth/auth.middleware');
const { checkTaskExists } = require('./task.middleware');

const router = Router();

router.use(optionalAuth);

router.post('/', taskController.createTask);
router.get('/', taskController.getAllTasks);
router.get('/my-tasks', taskController.getMyTasks);
router.get('/blocked', taskController.getBlockedTasks);
router.get('/:id', checkTaskExists, taskController.getTaskById);
router.put('/:id', checkTaskExists, taskController.updateTask);
router.patch('/:id/status', checkTaskExists, taskController.updateStatus);
router.patch('/:id/assign', checkTaskExists, taskController.assignTask);
router.post('/:id/dependencies', checkTaskExists, taskController.addDependency);
router.delete('/:id/dependencies/:dependencyId', checkTaskExists, taskController.removeDependency);
router.delete('/:id', checkTaskExists, taskController.deleteTask);

module.exports = router;
