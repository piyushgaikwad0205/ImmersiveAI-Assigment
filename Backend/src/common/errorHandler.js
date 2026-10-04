const { HTTP_STATUS } = require('./constants');
const ApiResponse = require('./response');

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.message || 'Internal Server Error';

    return ApiResponse.error(
        res,
        message,
        statusCode,
        err.errors || null
    );
};

module.exports = errorHandler;
