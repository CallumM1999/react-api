const mongoose = require('mongoose');

const Card = mongoose.model('cards', { 
    deck: String,
    front: String,
    back: String,
    id: String
});

module.exports = Card;