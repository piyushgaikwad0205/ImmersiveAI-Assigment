const userService = require('./user.service');
const ApiResponse = require('../../common/response');

class UserController {
    async getAllUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            return ApiResponse.success(res, users, 'Users retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            return ApiResponse.success(res, user, 'User retrieved successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();
