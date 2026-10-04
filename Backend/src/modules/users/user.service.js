const store = require('../../db/store');
const { NotFoundError } = require('../../common/errors');

class UserService {
    async getAllUsers() {
        return Array.from(store.users.values()).map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }));
    }

    async getUserById(id) {
        const user = store.users.get(id);
        if (!user) {
            throw new NotFoundError(`User with id ${id} not found`);
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };
    }
}

module.exports = new UserService();
