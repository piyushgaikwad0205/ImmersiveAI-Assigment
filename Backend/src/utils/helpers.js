const crypto = require('crypto');

const generateId = (prefix = '') => {
    const random = crypto.randomBytes(6).toString('hex');
    return prefix ? `${prefix}_${random}` : random;
};

const getIsoTimestamp = () => {
    return new Date().toISOString();
};

const hasCycle = (taskId, targetDependencyId, taskMap) => {
    const visited = new Set();

    const dfs = (currentId) => {
        if (currentId === taskId) return true;
        if (visited.has(currentId)) return false;

        visited.add(currentId);
        const currentTask = taskMap.get(currentId);
        if (!currentTask || !currentTask.dependencies) return false;

        for (const depId of currentTask.dependencies) {
            if (dfs(depId)) return true;
        }

        return false;
    };

    return dfs(targetDependencyId);
};

module.exports = {
    generateId,
    getIsoTimestamp,
    hasCycle
};
