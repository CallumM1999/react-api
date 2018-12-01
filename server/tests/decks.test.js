const expect = require('expect');
const request = require('supertest');

process.env.TESTING = true;

const { app } = require('../server');
const Deck = require('../mongoose/models/Deck');
const User = require('../mongoose/models/User');

const email = 'email@email.com';
const password = 'password';

let token = undefined;
let id = undefined;

before(done => {
    Deck.remove({}).then(() => {
        User.remove({}).then(() => {
            request(app)
            .post('/register')
            .send({ email, password })
            .then(response => {
                token = response.body.token;
                id = response.body.id;
                done();
            }).catch(e => done(e));

        }).catch(e => console.log(e));
    }).catch(e => console.log(e));
})

describe('GET /decks', () => {
    const name = 'some_deck';
    beforeEach(done => {
        const newDeck = new Deck({ name, owner: id });
        newDeck.save((error, deck) => {
            if (error) done('error pre-adding user');
            done();
        }) 
    })

    it('should get all decks', done => {
        request(app)
        .get('/decks')
        .set('authorization', token)
        .send()
        .then(response => {
            expect(response.status).toBe(200)
            done();
        }).catch(e => done(e));
    })

    it('should reject - no auth token', done => {
        request(app)
        .get('/decks')
        .send()
        .then(response => {
            expect(response.status).toBe(401)
            done();
        }).catch(e => done(e));
    })

    it('should reject - invalid auth token', done => {
        request(app)
        .get('/decks')
        .set('authorization', token + 's')
        .send()
        .then(response => {
            expect(response.status).toBe(401)
            done();
        }).catch(e => done(e));
    })
})

describe('POST /decks - add deck', () => {
    // const name = 'some_deck';
    beforeEach(done => {
        Deck.remove({}).then(() => done()).catch(e => done(e));
    })

    it('should add new deck', done => {
        const name = 'asduajsdj';
        request(app)
        .post('/decks')
        .set('authorization', token)
        .send({ name })
        .then(response => {
            expect(response.status).toBe(200);
            Deck.findOne({ name }, (err, deck) => {
                if (err) done(err);
                expect(deck.name).toBe(name);
                expect(deck.owner).toBe(id);
                done();
            })
        }).catch(e => done(e));
    })

    it('should reject - no auth', done => {
        const name = 'asbdjasdjasdn';
        request(app)
        .post('/decks')
        // .set('authorization', token)
        .send({ name })
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(e => done(e));
    })

    it('should reject - no name', done => {
        request(app)
        .post('/decks')
        .set('authorization', token)
        .send()
        .then(response => {
            expect(response.status).toBe(400);
            done();
        }).catch(e => done(e));
    })

    it('should reject - empty name', done => {
        request(app)
        .post('/decks')
        .set('authorization', token)
        .send({ name: '' })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        }).catch(e => done(e));
    })
})

describe('DELETE /decks', () => {
    const name = 'some_deck';
    let deckID = undefined;
    beforeEach(done => {
        Deck.remove({}).then(() => {
            const newDeck = new Deck({ name, owner: id });
            newDeck.save((error, deck) => {
                if (error) done(error);
                deckID = deck._id;
                done();
            });
        }).catch(e => done(e));
    })

    it('should delete deck', done => {
        request(app)
        .delete('/decks')
        .set('authorization', token)
        .set('id', deckID)
        .send()
        .then(response => {
            expect(response.status).toBe(200);
            expect(response.body.name).toBe(name);
            expect(response.body.owner).toBe(id);
            done();
        }).catch(e => done(e));
    })

    it('should reject - invalid id', done => {
        request(app)
        .delete('/decks')
        .set('authorization', token)
        .set('id', 'gyuj')
        .send()
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(e => done(e));
    })

    it('should reject - no auth', done => {
        request(app)
        .delete('/decks')
        // .set('authorization', token)
        .set('id', deckID)
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(e => done(e));
    })
})

describe('PUT /decks - update', () => {
    const name = 'some_deck';
    let deckID = undefined;
    beforeEach(done => {
        Deck.remove({}).then(() => {
            const newDeck = new Deck({ name, owner: id });
            newDeck.save((error, deck) => {
                if (error) done(error);
                deckID = deck._id;
                done();
            });
        }).catch(e => done(e));
    })

    it('should update deck', done => {
        const newName = 'some_new_name';
        request(app)
        .put('/decks')
        .set('authorization', token)
        .send({
            name: newName,
            id: deckID
        })
        .then(response => {
            expect(response.status).toBe(200);

            Deck.findById(deckID, (err, deck) => {
                if (err) return done(err);

                expect(deck.name).toBe(newName)
                expect(deck._id).toEqual(deckID)
                expect(deck.owner).toEqual(id)
                done()
            })
        }).catch(e => done(e));
    })

    it('should reject - empty new name', done => {
        const newName = 'some_new_name';
        request(app)
        .put('/decks')
        .set('authorization', token)
        .send({
            name: '',
            id: deckID
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();

        }).catch(e => done(e));
    })

    it('should reject - invalid deck id', done => {
        const newName = 'some_new_name';
        request(app)
        .put('/decks')
        .set('authorization', token)
        .send({
            name: newName,
            id: deckID + 's'
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();

        }).catch(e => done(e));
    })

    it('should reject - no auth', done => {
        const newName = 'some_new_name';
        request(app)
        .put('/decks')
        .send({
            name: newName,
            id: deckID
        })
        .then(response => {
            expect(response.status).toBe(401);
            done();

        }).catch(e => done(e));
    })

    
})