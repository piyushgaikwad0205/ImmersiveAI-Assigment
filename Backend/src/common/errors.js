const { HTTP_STATUS } = require('./constants');

class AppError extends Error {
    constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, HTTP_STATUS.NOT_FOUND);
    }
}

class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, HTTP_STATUS.BAD_REQUEST);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, HTTP_STATUS.UNAUTHORIZED);
    }
}

class ConflictError extends AppError {
    constructor(message = 'Conflict detected') {
        super(message, HTTP_STATUS.CONFLICT);
    }
}

module.exports = {
    AppError,
    NotFoundError,
    BadRequestError,
    UnauthorizedError,
    ConflictError
};
