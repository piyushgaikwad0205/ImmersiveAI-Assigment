const { validateRequired } = require('../../utils/validator');
const { BadRequestError } = require('../../common/errors');

class RegisterDto {
    constructor(body) {
        validateRequired(body, ['name', 'email']);
        
        if (!body.email.includes('@')) {
            throw new BadRequestError('Invalid email format');
        }

        this.name = body.name;
        this.email = body.email;
        this.role = body.role || 'developer';
    }
}

class LoginDto {
    constructor(body) {
        validateRequired(body, ['email']);
        this.email = body.email.trim().toLowerCase();
    }
}

module.exports = {
    RegisterDto,
    LoginDto
};
