const { generateId, getIsoTimestamp } = require('../../utils/helpers');

class AuthUser {
    constructor({ name, email, role = 'developer' }) {
        this.id = generateId('usr');
        this.name = name.trim();
        this.email = email.trim().toLowerCase();
        this.role = role;
        this.createdAt = getIsoTimestamp();
    }
}

module.exports = AuthUser;
