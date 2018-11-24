const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const Deck = require('../mongoose/models/Deck');

router.get('/decks', checkAuth, (req, res) => {
    Deck.find({ owner: req.userData.id }, (err, decks) => {
        if (err) return res.status(400).send();
        res.status(200).json(decks);
    });
});

router.post('/decks', checkAuth, (req, res) => {
    const data = req.body;
    const { userData } = req;

    if (!req.body.name) return res.status(400).send()
    if (JSON.stringify(data) !== JSON.stringify({})) {
        const newDeck = new Deck({ name: req.body.name, owner: userData.id });
        newDeck.save((error, deck) => {
            if (error) return res.status(400).send();
            res.status(200).send(deck);
        });
    } else {
        res.status(400).send();
    }
});

router.delete('/decks', checkAuth, (req, res) => {
    const id = req.headers.id;
    Deck.findByIdAndRemove(id, (err, deck) => {
        if (err) return res.status(400).send();
        if (!deck) return res.status(404).send();
        res.status(200).send(deck);
    });
});

// rename deck
router.put('/decks', checkAuth, (req, res) => {
    const { name, id } = req.body;
    if (!name) return res.status(400).send();
    Deck.findByIdAndUpdate(id, { name }, (err, deck) => {
        if (err) return res.status(400).send();
        res.status(200).send(deck);
    });
});

module.exports = router;