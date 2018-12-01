const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const Card = require('../mongoose/models/Card');
const Deck = require('../mongoose/models/Deck');

router.get('/cards', checkAuth, (req, res) => {
    const deckID = req.headers.deck;

    if (!deckID) return res.status(400).send('Unspecified deck');

    Deck.findById(deckID, (err, deck) => {
        if (err) return res.status(404).send('Error finding deck');

        Card.find({ deck: deckID }, (err, cards) => {
            if (err) return res.status(404).send('Errpr finding cards');
            // if (!cards) return res.status(404).send('Errpr finding cards');
            res.type('json').status(200).json(cards); // no cards isnt an error
        });
    })
});

router.post('/cards', checkAuth, (req, res) => {
    const { front, back, deckID } = req.body;

    if (!deckID) return res.status(400).send('Unspecified deck');

    if (!front || !back) return res.status(400).send('No front or back value');

    Deck.findById(deckID, (error, deck) => {
        
        if (error) return res.status(404).send('Error finding deck');
        if (!deck) return res.status(404).send('Deck doesnt exist');

        const newCard = new Card({ front, back, deck:deckID });

        newCard.save((error, card) => {
            if (error) return res.status(404).send('Error addig card');
            res.status(200).send(card);
        });
    })
});

router.delete('/cards', checkAuth, (req, res) => {
    const id = req.headers.id;

    if (!id) return res.status(400).send('Unspecified Card');

    Card.findByIdAndDelete(id, (err, card) => {
        if (err) return res.status(404).send('Error deleting card');
        if (!card) return res.status(404).send('Card not found');
        res.status(200).send(card);
    });
    
});

// edit deck
router.put('/cards', checkAuth, (req, res) => {
    const { id, front, back } = req.body;

    if (!id) return res.status(400).send('Unspecified Card');

    if (!front || !back) return res.status(400).send('No front or back value');

    Card.findByIdAndUpdate(id, { front, back }, (err, deck) => {
        if (err) return res.status(404).send('Error updating card');
        res.status(200).send(deck);
    });

});

module.exports = router;