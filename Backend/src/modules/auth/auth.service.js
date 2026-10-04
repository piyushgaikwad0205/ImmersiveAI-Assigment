const store = require('../../db/store');
const AuthUser = require('./auth.model');
const { ConflictError, NotFoundError, UnauthorizedError } = require('../../common/errors');
const { generateId } = require('../../utils/helpers');

class AuthService {
    async register(registerDto) {
        const existingUser = Array.from(store.users.values()).find(
            u => u.email === registerDto.email.toLowerCase()
        );

        if (existingUser) {
            throw new ConflictError('User with this email already exists');
        }

        const user = new AuthUser(registerDto);
        store.users.set(user.id, user);

        const token = generateId('tok');
        store.tokens.set(token, user.id);

        return { user, token };
    }

    async login(loginDto) {
        const user = Array.from(store.users.values()).find(
            u => u.email === loginDto.email
        );

        if (!user) {
            throw new NotFoundError('User not found with provided email');
        }

        const token = generateId('tok');
        store.tokens.set(token, user.id);

        return { user, token };
    }

    async getCurrentUser(userId) {
        const user = store.users.get(userId);
        if (!user) {
            throw new UnauthorizedError('Invalid user session');
        }
        return user;
    }
}

module.exports = new AuthService();
