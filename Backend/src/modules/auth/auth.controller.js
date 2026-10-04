const authService = require('./auth.service');
const { RegisterDto, LoginDto } = require('./auth.dto');
const ApiResponse = require('../../common/response');

class AuthController {
    async register(req, res, next) {
        try {
            const dto = new RegisterDto(req.body);
            const result = await authService.register(dto);
            return ApiResponse.created(res, result, 'User registered successfully');
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const dto = new LoginDto(req.body);
            const result = await authService.login(dto);
            return ApiResponse.success(res, result, 'Logged in successfully');
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = await authService.getCurrentUser(req.user.id);
            return ApiResponse.success(res, user, 'Profile fetched successfully');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new AuthController();
