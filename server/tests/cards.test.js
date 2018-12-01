const expect = require('expect');
const request = require('supertest');

process.env.TESTING = true;

const { app } = require('../server');
const Deck = require('../mongoose/models/Deck');
const User = require('../mongoose/models/User');
const Card = require('../mongoose/models/Card');

const email = 'email@email.com';
const password = 'password';
const deckName = 'some_deck_name';

let token = undefined;
let userID = undefined;
let deckID = undefined;

before(done => {
    Card.remove({}).then(() => {
        Deck.remove({}).then(() => {
            User.remove({}).then(() => {
                request(app)
                .post('/register')
                .send({ email, password })
                .then(response => {
                    token = response.body.token;
                    userID = response.body.id;

                    const newDeck = new Deck({ name: deckName, owner: userID });
                    newDeck.save((error, deck) => {
                        if (error) done(error);
                        deckID = deck._id;
                        done();
                    });
                }).catch(e => done(e));
            }).catch(e => done(e));
        }).catch(e => done(e));
    }).catch(e => done(e));


})

describe('GET /cards', () => {
    const front = 'front_value';
    const back = 'back_value';

    before(done => {
        const newCard = new Card({ deck: deckID, front, back });
        newCard.save((error, card) => {
            if (error) return done(error);

            done();
        });
    })


    it('should get cards', done => {
        request(app)
        .get('/cards')
        .set('authorization', token)
        .set('deck', deckID)
        .then(response => {
            expect(response.status).toBe(200);
            done();
        })
        .catch(e => done(e));
    })


    it('should reject - no auth', done => {
        request(app)
        .get('/cards')
        .set('deck', deckID)
        .then(response => {
            expect(response.status).toBe(401);
            done();
        })
        .catch(e => done(e));
    })

    it('should reject - invalid deck', done => {
        request(app)
        .get('/cards')
        .set('authorization', token)
        .set('deck', deckID + 'a')
        .then(response => {
            expect(response.status).toBe(404);
            done();
        })
        .catch(e => done(e));
    });
});

describe('POST /cards - Add card', () => {
    const front = 'some_front_value';
    const back = 'some_front_back';

    before(done => {

        Card.remove({}).then(() => {
            Deck.remove({}).then(() => {
                User.remove({}).then(() => {
                    request(app)
                    .post('/register')
                    .send({ email, password })
                    .then(response => {
                        token = response.body.token;
                        userID = response.body.id;
    
                        const newDeck = new Deck({ name: deckName, owner: userID });
                        newDeck.save((error, deck) => {
                            if (error) done(error);
                            deckID = deck._id;
                            done();
                        });
                    }).catch(e => done(e));
                }).catch(e => done(e));
            }).catch(e => done(e));
        }).catch(e => done(e));
    
    })

    it('should add a card', done => {
        request(app)
        .post('/cards')
        .set('authorization', token)
        .send({
            deckID,
            front,
            back
        })
        .then(response => {
            expect(response.status).toBe(200);

            Card.findById(response.body._id, (err, card) => {
                if (err) return done(err);
                expect(card.front).toBe(front)
                expect(card.back).toBe(back)
                done();
            })
        })
        .catch(e => done(e));
    })

    it('should reject - no auth', done => {
        request(app)
        .post('/cards')
        .send({
            deckID,
            front,
            back
        })
        .then(response => {
            expect(response.status).toBe(401);
            done();
        })
        .catch(e => done(e));
    })

    it('should reject - no front value', done => {
        request(app)
        .post('/cards')
        .set('authorization', token)
        .send({
            deckID,
            back
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        })
        .catch(e => done(e));
    })

    it('should reject - no back value', done => {
        request(app)
        .post('/cards')
        .set('authorization', token)
        .send({
            deckID,
            front
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        })
        .catch(e => done(e));
    })

    it('should reject - invalid deck id', done => {
        request(app)
        .post('/cards')
        .set('authorization', token)
        .send({
            deckID: deckID + 'a',
            back,
            front
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();
        })
        .catch(e => done(e));
    })

    
});

describe('DELETE /cards - Delete card', () => {
    const front = 'some_front_value';
    const back = 'some_front_back';
    let cardID = undefined;
    
    beforeEach(done => {
        cardID = undefined;
        const newCard = new Card({ front, back, deck: deckID });
        newCard.save((error, card) => {
            if (error) return done(error);

            cardID = card._id;
            done()
        });
    });

    it('should delete a card', done => {
        request(app)
        .delete('/cards')
        .set('authorization', token)
        .set('id', cardID)
        .then(response => {
            expect(response.status).toBe(200)
            Card.findById(cardID, (error, card) => {
                if (error) return done(error);

                if (card) return done(Error('found card'))
                done();
            })
        })
        .catch(e => done(e));
    });


    it('should reject - no auth', done => {
        request(app)
        .delete('/cards')
        .set('id', cardID)
        .then(response => {
            expect(response.status).toBe(401)
            done()
        })
        .catch(e => done(e));
    })

    it('should reject - invalid cardID', done => {
        request(app)
        .delete('/cards')
        .set('authorization', token)
        .set('id', cardID + 'a')
        .then(response => {
            expect(response.status).toBe(404)
            done()
        })
        .catch(e => done(e));
    })

});

describe('Put /cards - Update card', () => {
    const front = 'some_front_value';
    const back = 'some_front_back';
    const newFront = 'new_front_value';
    const newBack = 'new_bck_value';

    let cardID = undefined;

    beforeEach(done => {
        cardID = undefined;
        const newCard = new Card({ front, back, deck: deckID });
        newCard.save((error, card) => {
            if (error) return done(error);

            cardID = card._id;
            done()
        });
    });

    it('should update card', done => {
        request(app)
        .put('/cards')
        .set('authorization', token)
        .send({
            front: newFront,
            back: newBack,
            id: cardID
        })
        .then(response => {
            expect(response.status).toBe(200)
            Card.findById(cardID, (err, card) => {
                if (err) return done(err);
                expect(card.front).toBe(newFront);
                expect(card.back).toBe(newBack)
                done();
            })
        })
        .catch(e => done(e));
    })
    
    it('should reject - no auth', done => {
        request(app)
        .put('/cards')
        .send({
            front: newFront,
            back: newBack,
            id: cardID
        })
        .then(response => {
            expect(response.status).toBe(401);
            done();
        })
        .catch(e => done(e));
    })

    it('should reject - invalid id', done => {
        request(app)
        .put('/cards')
        .set('authorization', token)
        .send({
            front: newFront,
            back: newBack,
            id: cardID + 'a'
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();
        })
        .catch(e => done(e));
    })

    it('should reject - no front value', done => {
        request(app)
        .put('/cards')
        .set('authorization', token)
        .send({
            front: '',
            back: newBack,
            id: cardID + 'a'
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        })
        .catch(e => done(e));
    })

    it('should reject - no back value', done => {
        request(app)
        .put('/cards')
        .set('authorization', token)
        .send({
            front: newFront,
            back: '',
            id: cardID + 'a'
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        })
        .catch(e => done(e));
    })
});
