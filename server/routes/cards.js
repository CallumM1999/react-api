const checkAuth = require('../middleware/check-auth');

const Card = require('../mongoose/models/Card');
const Deck = require('../mongoose/models/Deck');


module.exports = (app, mongoose) => {

    // routes 
    app.get('/cards', checkAuth, (req, res) => {
        const deck = req.headers.deck;

        Card.find({ deck }, (err, cards) => {
            if (err) return res.status(400).send();
            res.type('json').status(200).json(cards);
        });
    });

    app.post('/cards', checkAuth, (req, res) => {

        const data = req.body;

        const deck = data.deck;

        Deck.findById(deck, (error, deck) => {
            if (!deck) return res.status(404).send('deck doesnt exist');
            if (error) return res.status(500).send('some error');
            if (JSON.stringify(data) === JSON.stringify({})) return res.status(400).send();

            const newCard = new Card(data);

            newCard.save((error, deck) => {
                if (error) return res.status(400).send(error);
                res.status(200).send(deck);
            });
        })

    });

    app.delete('/cards', checkAuth, (req, res) => {
        const id = req.headers.id;

        Card.findByIdAndDelete(id, (err, deck) => {
            if (err) return res.status(400).send();
            if (!deck) return res.status(404).send();
            res.status(200).send(deck);
        });
        
    });

    // edit deck
    app.put('/cards', checkAuth, (req, res) => {
        const { id, front, back } = req.body;

        if (!id || !front || !back) return res.status(400).send();

        Card.findByIdAndUpdate(id, { front, back }, (err, deck) => {
            if (err) return res.status(400).send();
            res.status(200).send(deck);
        });
   
    });
};