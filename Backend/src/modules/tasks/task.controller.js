const taskService = require('./task.service');
const {
    CreateTaskDto,
    UpdateTaskDto,
    UpdateStatusDto,
    AssignTaskDto,
    DependencyDto
} = require('./task.dto');
const ApiResponse = require('../../common/response');

class TaskController {
    async createTask(req, res, next) {
        try {
            const dto = new CreateTaskDto(req.body);
            const creatorId = req.user ? req.user.id : null;
            const task = await taskService.createTask(dto, creatorId);
            return ApiResponse.created(res, task, 'Task created successfully');
        } catch (error) {
            next(error);
        }
    }

    async getAllTasks(req, res, next) {
        try {
            const filters = {
                status: req.query.status,
                priority: req.query.priority,
                assignedTo: req.query.assignedTo,
                search: req.query.search,
                isBlocked: req.query.isBlocked
            };
            const tasks = await taskService.getAllTasks(filters);
            return ApiResponse.success(res, tasks, 'Tasks retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async getTaskById(req, res, next) {
        try {
            const task = await taskService.getTaskById(req.params.id);
            return ApiResponse.success(res, task, 'Task retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async getMyTasks(req, res, next) {
        try {
            const userId = req.user ? req.user.id : req.query.userId;
            const tasks = await taskService.getMyTasks(userId);
            return ApiResponse.success(res, tasks, 'My tasks retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async getBlockedTasks(req, res, next) {
        try {
            const tasks = await taskService.getBlockedTasks();
            return ApiResponse.success(res, tasks, 'Blocked tasks retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async updateTask(req, res, next) {
        try {
            const dto = new UpdateTaskDto(req.body);
            const task = await taskService.updateTask(req.params.id, dto);
            return ApiResponse.success(res, task, 'Task updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async updateStatus(req, res, next) {
        try {
            const dto = new UpdateStatusDto(req.body);
            const task = await taskService.updateTaskStatus(req.params.id, dto.status);
            return ApiResponse.success(res, task, 'Task status updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async assignTask(req, res, next) {
        try {
            const dto = new AssignTaskDto(req.body);
            const task = await taskService.assignTask(req.params.id, dto.assignedTo);
            return ApiResponse.success(res, task, 'Task assigned successfully');
        } catch (error) {
            next(error);
        }
    }

    async addDependency(req, res, next) {
        try {
            const dto = new DependencyDto(req.body);
            const task = await taskService.addDependency(req.params.id, dto.dependsOnTaskId);
            return ApiResponse.success(res, task, 'Dependency added successfully');
        } catch (error) {
            next(error);
        }
    }

    async removeDependency(req, res, next) {
        try {
            const task = await taskService.removeDependency(req.params.id, req.params.dependencyId);
            return ApiResponse.success(res, task, 'Dependency removed successfully');
        } catch (error) {
            next(error);
        }
    }

    async deleteTask(req, res, next) {
        try {
            const result = await taskService.deleteTask(req.params.id);
            return ApiResponse.success(res, result, 'Task deleted successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new TaskController();
