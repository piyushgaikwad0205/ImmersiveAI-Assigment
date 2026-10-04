const { BadRequestError } = require('../common/errors');

const validateRequired = (body, fields) => {
    const missing = [];
    for (const field of fields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            missing.push(field);
        }
    }
    if (missing.length > 0) {
        throw new BadRequestError(`Missing required fields: ${missing.join(', ')}`);
    }
};

const validateEnum = (value, enumObject, fieldName) => {
    const allowed = Object.values(enumObject);
    if (value && !allowed.includes(value)) {
        throw new BadRequestError(`Invalid ${fieldName}. Allowed values: ${allowed.join(', ')}`);
    }
};

module.exports = {
    validateRequired,
    validateEnum
};
