const User = require('../../models/User');

const findUser = query => {
    return new Promise((resolve, reject) => {
        User.findOne(query)
        .exec((error, user) => {
            if (error) return reject(new Error({ error }));
            resolve(user);
        });
    });
}

module.exports = findUser;