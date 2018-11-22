const mongoose = require('mongoose');

const Deck = mongoose.model('decks', {
    name: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    }
});

module.exports = Deck;