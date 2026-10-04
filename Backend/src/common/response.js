const { HTTP_STATUS } = require('./constants');

class ApiResponse {
    static success(res, data = null, message = 'Success', statusCode = HTTP_STATUS.OK) {
        return res.status(statusCode).json({
            success: true,
            message,
            data
        });
    }

    static created(res, data = null, message = 'Resource created successfully') {
        return res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message,
            data
        });
    }

    static error(res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(errors && { errors })
        });
    }
}

module.exports = ApiResponse;
