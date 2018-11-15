const mongoose = require('mongoose');

const Deck = mongoose.model('decks', {
    name: String,
    id: String,
    owner: String 
});

module.exports = Deck;