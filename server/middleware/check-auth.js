const jwt = require('jsonwebtoken');
const jwt_key = process.env.TOKEN_SECRET || 'oN6nuiwcOVW06GbLwKWaCH5ohap9ieMlxwEb6zENFeurbAVhGBD74DQekaDbGf4vCZfPVM6tZkBtiCdiww2Rb34qq7CkEQoqF8y5';

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization;
        const decoded = jwt.verify(token, jwt_key);
        req.userData = decoded;
        next();
    } catch(error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
};