const store = require('../../db/store');
const Task = require('./task.model');
const { TASK_STATUS } = require('../../common/constants');
const { NotFoundError, BadRequestError } = require('../../common/errors');
const { getIsoTimestamp, hasCycle } = require('../../utils/helpers');

class TaskService {
    enrichTask(task) {
        const assignedUser = task.assignedTo ? store.users.get(task.assignedTo) || null : null;
        const assignedUsers = (task.users || []).map(uid => store.users.get(uid)).filter(Boolean);

        const dependencyDetails = (task.dependencies || []).map(depId => {
            const depTask = store.tasks.get(depId);
            if (!depTask) {
                return { id: depId, title: 'Unknown Task', status: 'Deleted', isCompleted: false };
            }
            return {
                id: depTask.id,
                title: depTask.title,
                status: depTask.status,
                isCompleted: depTask.status === TASK_STATUS.DONE
            };
        });

        const blockingDependencies = dependencyDetails.filter(dep => !dep.isCompleted);
        const isBlocked = task.status !== TASK_STATUS.DONE && blockingDependencies.length > 0;

        return {
            ...task,
            category: task.category || 'General',
            due: typeof task.due === 'number' ? task.due : 7,
            progress: typeof task.progress === 'number' ? task.progress : (task.status === TASK_STATUS.DONE ? 100 : task.status === TASK_STATUS.IN_PROGRESS ? 50 : 0),
            assignedUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name, email: assignedUser.email, color: assignedUser.color } : null,
            assignedUsers: assignedUsers.map(u => ({ id: u.id, name: u.name, email: u.email, color: u.color })),
            dependencyDetails,
            blockingDependencies,
            isBlocked
        };
    }

    validateDependencies(taskId, dependencies) {
        if (!Array.isArray(dependencies)) return;

        for (const depId of dependencies) {
            if (taskId && depId === taskId) {
                throw new BadRequestError('A task cannot depend on itself');
            }

            if (!store.tasks.has(depId)) {
                throw new NotFoundError(`Dependency task with id ${depId} does not exist`);
            }

            if (taskId && hasCycle(taskId, depId, store.tasks)) {
                throw new BadRequestError(`Circular dependency detected between task ${taskId} and task ${depId}`);
            }
        }
    }

    validateCompletionEligibility(task) {
        const uncompletedDeps = [];
        for (const depId of (task.dependencies || [])) {
            const depTask = store.tasks.get(depId);
            if (!depTask || depTask.status !== TASK_STATUS.DONE) {
                uncompletedDeps.push(depTask ? `${depTask.title} (${depTask.id})` : depId);
            }
        }

        if (uncompletedDeps.length > 0) {
            throw new BadRequestError(
                `Cannot complete task. Pending dependencies: ${uncompletedDeps.join(', ')}`
            );
        }
    }

    async createTask(createTaskDto, creatorId = null) {
        if (createTaskDto.assignedTo && !store.users.has(createTaskDto.assignedTo)) {
            throw new NotFoundError(`Assigned user with id ${createTaskDto.assignedTo} not found`);
        }

        this.validateDependencies(null, createTaskDto.dependencies);

        const task = new Task({
            ...createTaskDto,
            createdBy: creatorId
        });

        if (task.status === TASK_STATUS.DONE && task.dependencies.length > 0) {
            this.validateCompletionEligibility(task);
        }

        store.tasks.set(task.id, task);
        return this.enrichTask(task);
    }

    async getAllTasks(filters = {}) {
        let tasks = Array.from(store.tasks.values());

        if (filters.status) {
            tasks = tasks.filter(t => t.status.toLowerCase() === filters.status.toLowerCase());
        }

        if (filters.priority) {
            tasks = tasks.filter(t => t.priority.toLowerCase() === filters.priority.toLowerCase());
        }

        if (filters.assignedTo) {
            tasks = tasks.filter(t => t.assignedTo === filters.assignedTo || (t.users && t.users.includes(filters.assignedTo)));
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            tasks = tasks.filter(t =>
                t.title.toLowerCase().includes(searchLower) ||
                (t.description && t.description.toLowerCase().includes(searchLower)) ||
                (t.category && t.category.toLowerCase().includes(searchLower))
            );
        }

        const enriched = tasks.map(t => this.enrichTask(t));

        if (filters.isBlocked !== undefined) {
            const blockedBool = filters.isBlocked === 'true' || filters.isBlocked === true;
            return enriched.filter(t => t.isBlocked === blockedBool);
        }

        return enriched;
    }

    async getTaskById(id) {
        const task = store.tasks.get(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }
        return this.enrichTask(task);
    }

    async getMyTasks(userId) {
        if (!userId) {
            throw new BadRequestError('User ID is required to fetch assigned tasks');
        }

        const tasks = Array.from(store.tasks.values())
            .filter(t => t.assignedTo === userId || (t.users && t.users.includes(userId)))
            .map(t => this.enrichTask(t));

        return tasks;
    }

    async getBlockedTasks() {
        const tasks = Array.from(store.tasks.values())
            .map(t => this.enrichTask(t))
            .filter(t => t.isBlocked);

        return tasks;
    }

    async updateTask(id, updateTaskDto) {
        const task = store.tasks.get(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }

        if (updateTaskDto.assignedTo && !store.users.has(updateTaskDto.assignedTo)) {
            throw new NotFoundError(`Assigned user with id ${updateTaskDto.assignedTo} not found`);
        }

        if (updateTaskDto.dependencies !== undefined) {
            this.validateDependencies(id, updateTaskDto.dependencies);
            task.dependencies = Array.from(new Set(updateTaskDto.dependencies));
        }

        const nextStatus = updateTaskDto.status || task.status;
        if (nextStatus === TASK_STATUS.DONE) {
            this.validateCompletionEligibility(task);
        }

        if (updateTaskDto.title !== undefined) task.title = updateTaskDto.title.trim();
        if (updateTaskDto.description !== undefined) task.description = updateTaskDto.description.trim();
        if (updateTaskDto.category !== undefined) task.category = updateTaskDto.category;
        if (updateTaskDto.priority !== undefined) task.priority = updateTaskDto.priority;
        if (updateTaskDto.status !== undefined) task.status = updateTaskDto.status;
        if (updateTaskDto.assignedTo !== undefined) task.assignedTo = updateTaskDto.assignedTo;
        if (updateTaskDto.users !== undefined) task.users = updateTaskDto.users;
        if (updateTaskDto.due !== undefined) task.due = updateTaskDto.due;
        if (updateTaskDto.progress !== undefined) {
            task.progress = updateTaskDto.progress;
        } else if (updateTaskDto.status !== undefined) {
            task.progress = updateTaskDto.status === TASK_STATUS.DONE ? 100 : updateTaskDto.status === TASK_STATUS.TODO ? 0 : Math.max(task.progress || 0, 10);
        }
        if (updateTaskDto.dueDate !== undefined) task.dueDate = updateTaskDto.dueDate;

        task.updatedAt = getIsoTimestamp();
        store.tasks.set(task.id, task);

        return this.enrichTask(task);
    }

    async updateTaskStatus(id, status) {
        const task = store.tasks.get(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }

        if (status === TASK_STATUS.DONE) {
            this.validateCompletionEligibility(task);
        }

        task.status = status;
        task.progress = status === TASK_STATUS.DONE ? 100 : status === TASK_STATUS.TODO ? 0 : Math.max(task.progress || 0, 10);
        task.updatedAt = getIsoTimestamp();
        store.tasks.set(task.id, task);

        return this.enrichTask(task);
    }

    async assignTask(id, userId, users = null) {
        const task = store.tasks.get(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }

        if (userId !== null && !store.users.has(userId)) {
            throw new NotFoundError(`User with id ${userId} not found`);
        }

        task.assignedTo = userId;
        if (users && Array.isArray(users)) {
            task.users = users;
        } else if (userId) {
            task.users = [userId];
        } else {
            task.users = [];
        }

        task.updatedAt = getIsoTimestamp();
        store.tasks.set(task.id, task);

        return this.enrichTask(task);
    }

    async addDependency(id, dependsOnTaskId) {
        const task = store.tasks.get(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }

        this.validateDependencies(id, [dependsOnTaskId]);

        if (!task.dependencies.includes(dependsOnTaskId)) {
            task.dependencies.push(dependsOnTaskId);
            task.updatedAt = getIsoTimestamp();
            store.tasks.set(task.id, task);
        }

        return this.enrichTask(task);
    }

    async removeDependency(id, dependsOnTaskId) {
        const task = store.tasks.get(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }

        task.dependencies = task.dependencies.filter(depId => depId !== dependsOnTaskId);
        task.updatedAt = getIsoTimestamp();
        store.tasks.set(task.id, task);

        return this.enrichTask(task);
    }

    async deleteTask(id) {
        const task = store.tasks.get(id);
        if (!task) {
            throw new NotFoundError(`Task with id ${id} not found`);
        }

        store.tasks.delete(id);

        for (const existingTask of store.tasks.values()) {
            if (existingTask.dependencies.includes(id)) {
                existingTask.dependencies = existingTask.dependencies.filter(depId => depId !== id);
                existingTask.updatedAt = getIsoTimestamp();
            }
        }

        return { id };
    }
}

module.exports = new TaskService();
