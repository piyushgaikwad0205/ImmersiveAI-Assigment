const store = require('../../db/store');
const { UnauthorizedError } = require('../../common/errors');

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const xUserId = req.headers['x-user-id'];

        let userId = null;

        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.slice(7)
                : authHeader;
            userId = store.tokens.get(token);
        } else if (xUserId) {
            userId = xUserId;
        }

        if (!userId || !store.users.has(userId)) {
            throw new UnauthorizedError('Authentication required');
        }

        req.user = store.users.get(userId);
        next();
    } catch (error) {
        next(error);
    }
};

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const xUserId = req.headers['x-user-id'];

    let userId = null;

    if (authHeader) {
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.slice(7)
            : authHeader;
        userId = store.tokens.get(token);
    } else if (xUserId) {
        userId = xUserId;
    }

    if (userId && store.users.has(userId)) {
        req.user = store.users.get(userId);
    }

    next();
};

module.exports = {
    authenticate,
    optionalAuth
};
