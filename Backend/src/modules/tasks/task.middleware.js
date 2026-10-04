const store = require('../../db/store');
const { NotFoundError } = require('../../common/errors');

const checkTaskExists = (req, res, next) => {
    const taskId = req.params.id;
    if (!store.tasks.has(taskId)) {
        return next(new NotFoundError(`Task with id ${taskId} does not exist`));
    }
    next();
};

module.exports = {
    checkTaskExists
};
