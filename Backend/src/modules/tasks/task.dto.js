const { validateRequired, validateEnum } = require('../../utils/validator');
const { TASK_STATUS, TASK_PRIORITY } = require('../../common/constants');
const { BadRequestError } = require('../../common/errors');

class CreateTaskDto {
    constructor(body) {
        validateRequired(body, ['title']);

        if (body.priority) {
            validateEnum(body.priority, TASK_PRIORITY, 'priority');
        }

        if (body.status) {
            validateEnum(body.status, TASK_STATUS, 'status');
        }

        if (body.dependencies && !Array.isArray(body.dependencies)) {
            throw new BadRequestError('dependencies must be an array of task IDs');
        }

        if (body.users && !Array.isArray(body.users)) {
            throw new BadRequestError('users must be an array of user IDs');
        }

        this.title = body.title;
        this.description = body.description || '';
        this.category = body.category || body.cat || 'General';
        this.priority = body.priority || TASK_PRIORITY.MEDIUM;
        this.status = body.status || TASK_STATUS.TODO;
        this.assignedTo = body.assignedTo || (body.users && body.users.length > 0 ? body.users[0] : null);
        this.users = body.users || (body.assignedTo ? [body.assignedTo] : []);
        this.dependencies = body.dependencies || body.deps || [];
        this.due = typeof body.due === 'number' ? body.due : 7;
        this.progress = typeof body.progress === 'number' ? body.progress : (typeof body.prog === 'number' ? body.prog : null);
        this.dueDate = body.dueDate || null;
    }
}

class UpdateTaskDto {
    constructor(body) {
        if (body.priority) {
            validateEnum(body.priority, TASK_PRIORITY, 'priority');
        }

        if (body.status) {
            validateEnum(body.status, TASK_STATUS, 'status');
        }

        if (body.dependencies && !Array.isArray(body.dependencies)) {
            throw new BadRequestError('dependencies must be an array of task IDs');
        }

        if (body.users && !Array.isArray(body.users)) {
            throw new BadRequestError('users must be an array of user IDs');
        }

        this.title = body.title !== undefined ? body.title : undefined;
        this.description = body.description !== undefined ? body.description : undefined;
        this.category = body.category !== undefined ? body.category : (body.cat !== undefined ? body.cat : undefined);
        this.priority = body.priority !== undefined ? body.priority : undefined;
        this.status = body.status !== undefined ? body.status : undefined;
        this.assignedTo = body.assignedTo !== undefined ? body.assignedTo : undefined;
        this.users = body.users !== undefined ? body.users : (body.assignedTo ? [body.assignedTo] : undefined);
        this.dependencies = body.dependencies !== undefined ? body.dependencies : (body.deps !== undefined ? body.deps : undefined);
        this.due = body.due !== undefined ? body.due : undefined;
        this.progress = body.progress !== undefined ? body.progress : (body.prog !== undefined ? body.prog : undefined);
        this.dueDate = body.dueDate !== undefined ? body.dueDate : undefined;
    }
}

class UpdateStatusDto {
    constructor(body) {
        validateRequired(body, ['status']);
        validateEnum(body.status, TASK_STATUS, 'status');
        this.status = body.status;
    }
}

class AssignTaskDto {
    constructor(body) {
        this.assignedTo = body.assignedTo || null;
        this.users = body.users || (body.assignedTo ? [body.assignedTo] : []);
    }
}

class DependencyDto {
    constructor(body) {
        validateRequired(body, ['dependsOnTaskId']);
        this.dependsOnTaskId = body.dependsOnTaskId;
    }
}

module.exports = {
    CreateTaskDto,
    UpdateTaskDto,
    UpdateStatusDto,
    AssignTaskDto,
    DependencyDto
};
