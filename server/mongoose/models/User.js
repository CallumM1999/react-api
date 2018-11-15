const mongoose = require('mongoose');

const User = mongoose.model('user', { 
    name: String, 
    age: Number, 
    email: String, 
    password: String,
    confirmed: {
        type: Boolean,
        default: false
    },
    code: String,
});

module.exports = User;