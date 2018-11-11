const checkAuth = require('../middleware/check-auth');

module.exports = (app, mongoose) => {

    const Card = mongoose.model('cards', { 
        deck: String,
        front: String,
        back: String,
        id: String
    })

    // routes 
    app.get('/cards', checkAuth, (req, res) => {
        const { id } = req.headers;

        Card.find({deck: id}, (err, cards) => {
            if (err) return res.status(400).send();
            res.type('json').status(200).json(cards);
        })
    })

    app.post('/cards', checkAuth, (req, res) => {
        const data = req.body;

        if (JSON.stringify(data) !== JSON.stringify({})) {
            const newCard = new Card(data);
            newCard.save((error, deck) => {
                if (error) return res.status(400).send();
                res.status(200).send();
            })
        }
        return res.status(400).send();
    });

    app.delete('/cards', checkAuth, (req, res) => {
        const data = req.headers.data;

        if (data) {
            const id = data.id;

            Card.findOneAndDelete({ id }, (err, deck) => {
                if (err) return res.status(400).send();
                res.status(200).json({ data: JSON.stringify(data) });
            })
        }
        res.status(400).send();
    });

    // edit deck
    app.put('/cards', checkAuth, (req, res) => {
        const { id, front, back } = req.body;


        if (id && front && back) {
            Card.findOneAndUpdate({ id }, { front, back }, (err, deck) => {
                if (err) return res.status(400).send();
                res.status(200).send();
            });
        }
        res.status(400).send();
    })
}