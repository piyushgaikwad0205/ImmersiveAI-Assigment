const { TASK_STATUS, TASK_PRIORITY } = require('../../common/constants');
const { generateId, getIsoTimestamp } = require('../../utils/helpers');

class Task {
    constructor({
        id = null,
        title,
        description = '',
        category = 'Development',
        priority = TASK_PRIORITY.MEDIUM,
        status = TASK_STATUS.TODO,
        assignedTo = null,
        users = [],
        dependencies = [],
        createdBy = null,
        due = 7,
        progress = null,
        dueDate = null
    }) {
        this.id = id || generateId('tsk');
        this.title = title ? title.trim() : '';
        this.description = description ? description.trim() : '';
        this.category = category || 'General';
        this.priority = priority;
        this.status = status;
        this.assignedTo = assignedTo || (users && users.length > 0 ? users[0] : null);
        this.users = users && users.length > 0 ? Array.from(new Set(users)) : (this.assignedTo ? [this.assignedTo] : []);
        this.dependencies = Array.isArray(dependencies) ? Array.from(new Set(dependencies)) : [];
        this.createdBy = createdBy;
        this.due = typeof due === 'number' ? due : 7;
        this.dueDate = dueDate || null;
        this.progress = typeof progress === 'number'
            ? progress
            : (status === TASK_STATUS.DONE ? 100 : status === TASK_STATUS.IN_PROGRESS ? 50 : 0);
        this.createdAt = getIsoTimestamp();
        this.updatedAt = getIsoTimestamp();
    }
}

module.exports = Task;
