const checkAuth = require('../middleware/check-auth');

module.exports = (app, mongoose) => {
    const Deck = mongoose.model('decks', { name: String, id: String, owner: String })

    // routes 
    app.get('/decks', checkAuth, (req, res) => {
        const id = req.headers.id;

        Deck.find({ owner: id }, (err, data) => {
            if (err) return res.status(400).send();
            res.type('json').status(200).json(data);
        })
    })

    app.post('/decks', checkAuth, (req, res) => {
        const data = req.body;

        if (JSON.stringify(data) !== JSON.stringify({})) {
            // console.log('not empty')
            const newDeck = new Deck(data);
            newDeck.save((error, deck) => {
                if (error) return res.status(400).send();
                res.status(200).send();
            })
        } else {
            res.status(400).send();
        }
    });

    app.delete('/decks', checkAuth, (req, res) => {
        const id = req.headers.id;
        if (id) {
            Deck.findOneAndDelete({ id }, (err, deck) => {

                if (err) return res.status(400).send();
                if (!deck) return res.status(404).send();
                res.status(200).send();
            })
        } else {
            res.status(400).send();
        }
    });

    // rename deck
    app.put('/decks', checkAuth, (req, res) => {
        const { name, id } = req.body;

        if (name) {
            Deck.findOneAndUpdate({ id }, { name }, (err, deck) => {
                if (err) return res.status(400).send();
                res.status(200).send();
            });
        }
    })
}