const User = require('../../models/User');

const registerUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const newUser = new User({ email, password });

        newUser.save((error, user) => {
            if (error) reject(new Error(error));
            resolve(user);
        }) 
    });
};

module.exports = registerUser;