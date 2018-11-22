const checkAuth = require('../middleware/check-auth');

const Deck = require('../mongoose/models/Deck');


module.exports = (app, mongoose) => {

// routes 
    app.get('/decks', checkAuth, (req, res) => {
        Deck.find({ owner: req.userData.id }, (err, decks) => {
            if (err) return res.status(400).send();
            res.status(200).json(decks);
        });
    });

    app.post('/decks', checkAuth, (req, res) => {
        const data = req.body;
        const { userData } = req;

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

    app.delete('/decks', checkAuth, (req, res) => {
        const id = req.headers.id;
        Deck.findByIdAndRemove(id, (err, deck) => {
            if (err) return res.status(400).send();
            if (!deck) return res.status(404).send();
            res.status(200).send(deck);
        });
    });

    // rename deck
    app.put('/decks', checkAuth, (req, res) => {
        const { name, id } = req.body;
        Deck.findByIdAndUpdate(id, { name }, (err, deck) => {
            if (err) return res.status(400).send();
            res.status(200).send(deck);
        });
    });
};