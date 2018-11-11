const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization;
        // console.log('token', token)

        const decoded = jwt.verify(token, 'secret');

        req.userData = decoded;
        next();

    } catch(error) {
        return res.status(401).json({
            message: 'Auth failed'
        });
    }
    


};