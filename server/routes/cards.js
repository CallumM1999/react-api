const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');

const Card = require('../mongoose/models/Card');
const Deck = require('../mongoose/models/Deck');

router.get('/cards', checkAuth, (req, res) => {
    const deckID = req.headers.deck;

    if (!deckID) return res.status(404).send();

    Deck.findById(deckID, (err, deck) => {
        if (err) return res.status(404).send();

        Card.find({ deck: deckID }, (err, cards) => {
            if (err) return res.status(400).send();
            res.type('json').status(200).json(cards);
        });
    })
});

router.post('/cards', checkAuth, (req, res) => {
    const { front, back, deckID } = req.body;

    Deck.findById(deckID, (error, deck) => {
        
        if (error) return res.status(500).send('some error');
        if (!deck) return res.status(404).send('deck doesnt exist');

        const newCard = new Card({ front, back, deck:deckID });

        newCard.save((error, card) => {
            if (error) return res.status(400).send(error);
            res.status(200).send(card);
        });
    })

});

router.delete('/cards', checkAuth, (req, res) => {
    const id = req.headers.id;

    Card.findByIdAndDelete(id, (err, deck) => {
        if (err) return res.status(400).send();
        if (!deck) return res.status(404).send();
        res.status(200).send(deck);
    });
    
});

// edit deck
router.put('/cards', checkAuth, (req, res) => {
    const { id, front, back } = req.body;

    if (!id || !front || !back) return res.status(400).send();

    Card.findByIdAndUpdate(id, { front, back }, (err, deck) => {
        if (err) return res.status(400).send();
        res.status(200).send(deck);
    });

});

module.exports = router;