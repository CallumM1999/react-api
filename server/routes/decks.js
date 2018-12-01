const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Deck = require('../mongoose/models/Deck');
const Card = require('../mongoose/models/Card');


router.get('/decks', checkAuth, (req, res) => {
    Deck.find({ owner: req.userData.id }, (err, deck) => {
        if (err) return res.status(404).send('Error finding deck');
        if (!deck) return res.status(404).send('Deck not found');
        res.status(200).json(deck);
    });
});

router.post('/decks', checkAuth, (req, res) => {
    const { name } = req.body;
    const { id } = req.userData;

    if (!name) return res.status(400).send('Missing deck')

    const newDeck = new Deck({ name, owner: id });

    newDeck.save((error, deck) => {
        if (error) return res.status(404).send('Error creating deck');
        res.status(200).send(deck);
    });
});

router.delete('/decks', checkAuth, (req, res) => {

    const { id } = req.headers;

    if (!id) return res.status(400).send('Unspecified Deck')

    Deck.findByIdAndRemove(id, (err, deck) => {
        if (err) return res.status(404).send('Error delting deck');
        if (!deck) return res.status(404).send('Deck not found');

        // delete all cards
        Card.deleteMany({ deck: id }, (err, cards) => {
            if (err) return res.status(404).send('Error delting remaining cards in deck');
            
            res.status(200).send(deck);
        });
    });
});

// rename deck
router.put('/decks', checkAuth, (req, res) => {
    const { name, id } = req.body;

    if (!id) return res.status(400).send('Unspecified Deck')
    if (!name) return res.status(400).send('Missing name value');

    Deck.findByIdAndUpdate(id, { name }, (err, deck) => {
        // console.log('=================', err)

        if (err) return res.status(404).send('Error updating deck');
        res.status(200).send(deck);
    });
});

module.exports = router;