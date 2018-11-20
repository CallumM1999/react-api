const User = require('../../models/User');

const findUserAndUpdate = (query, changes) => {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate(query, changes)
        .exec((error, user) => {
            if (error) reject(new Error(error));
            resolve(user);
        });
    });
}

module.exports = findUserAndUpdate;