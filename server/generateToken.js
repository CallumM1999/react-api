const jwt_key = 'secret';
const jwt = require('jsonwebtoken');

const generateToken = data => {
    return jwt.sign(data, jwt_key, { expiresIn: '1hour' });
};

module.exports = generateToken;