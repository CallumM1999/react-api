const mongoose = require('mongoose');

const Card = mongoose.model('cards', { 
    deck: {
        type: String,
        required: true
    },
    front: {
        type: String,
        required: true
    },
    back: {
        type: String,
        required: true
    }
});

module.exports = Card;