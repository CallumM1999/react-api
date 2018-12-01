const expect = require('expect');
const request = require('supertest');
const bcrypt = require('bcrypt');
const generateCode = require('../utils/generateCode');

process.env.TESTING = true;

const { app } = require('../server');
const User = require('../mongoose/models/User');

before(done => {
    User.remove({}).then().catch(e => console.log(e));

    // console.log('running before MAIN')
    done();
})

const email = 'email@email.com';
const password = 'password';

describe('register user POST /register', () => {

    beforeEach(done => {
        User.remove({}).then().catch(e => console.log(e));
    
        // console.log('running before MAIN')
        done();
    })

    it('should register new user', done => {
        request(app)
        .post('/register')
        .send({ email, password })
        .then(response => {
            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('token')
            expect(response.body).toHaveProperty('email', email)
            expect(response.body).toHaveProperty('id')

            done();

        }).catch(e => done(e));
    })

    it('should reject - invalid email', done => {
        request(app)
        .post('/register')
        .send({ email:'vguhbhujhj', password })
        .then(response => {
            expect(response.status).toBe(400)
            done();

        }).catch(e => done(e));
    });

    it('should reject - no password', done => {
        request(app)
        .post('/register')
        .send({ email, password: '' })
        .then(response => {
            expect(response.status).toBe(400)
            done();

        }).catch(e => done(e));
    });
})

describe('auth POST /login', () => {

    before(done => {
        bcrypt.hash(password, 4, (err, hash) => {
            const newUser = new User({ email, password:hash });
            newUser.save((error, user) => {
                if (error) done('error pre-adding user');

                done();
            }) 
        });    
    })

    it('should reject - invalid password', done => {
        request(app)
        .post('/login')
        .send({
            email,
            password: 'wrongpassword'
        })
        .then(response => {
            expect(response.status).toBe(401)
            done();
        }).catch(error => done(error))
    });   
    
    it('should reject - non registered email address', done => {
        request(app)
        .post('/login')
        .send({
            email: 'email2@gmail.com',
            password
        })
        .then(response => {
            expect(response.status).toBe(401)
            done();
        }).catch(error => done(error))
    });    

    it('should login', done => {        
        request(app)
        .post('/login')
        .send({
            email,
            password
        })
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('token')
            expect(response.body).toHaveProperty('email')
            expect(response.body).toHaveProperty('id')

            done();
        }).catch(error => done(error))
    })
})

describe('POST /reset/code', () => {
    before(done => {
        bcrypt.hash(password, 4, (err, hash) => {
            const newUser = new User({ email, password:hash });
            newUser.save((error, user) => {
                if (error) done('error pre-adding user');

                done();
            }) 
        });    
    });

    it('should get code' , done => {
        request(app)
        .post('/reset/code')
        .send({
            email
        })
        .then(response => {
            expect(response.status).toBe(204);
            User.findOne({ email }, (err, user) => {
                if (err) return done(err);
                expect(user).toHaveProperty('email', email)
                expect(user).toHaveProperty('code')
                done()
            })
        }).catch(error => done(error))
    });

    it('should reject - no email' , done => {
        request(app)
        .post('/reset/code')
        .send({
            email: ''
        })
        .then(response => {
            expect(response.status).toBe(400);
            done()
        }).catch(error => done(error))
    });

    it('should reject - not registered email' , done => {
        request(app)
        .post('/reset/code')
        .send({
            email: 'email2@email.com'
        })
        .then(response => {
            expect(response.status).toBe(204);
            done()
        }).catch(error => done(error))
    });
    
});

describe('POST /reset/code/resend', () => {
    before(done => {
        bcrypt.hash(password, 4, (err, hash) => {
            const newUser = new User({ email, password:hash });
            newUser.save((error, user) => {
                if (error) done('error pre-adding user');

                done();
            }) 
        });    
    });

    it('should get code' , done => {
        request(app)
        .post('/reset/code/resend')
        .send({
            email
        })
        .then(response => {
            expect(response.status).toBe(204);
            User.findOne({ email }, (err, user) => {
                if (err) return done(err);

                // console.log('found user', user)

                expect(user).toHaveProperty('email', email)
                expect(user).toHaveProperty('code')
                done()
            })
        }).catch(error => done(error))
    });

    it('should reject - no email' , done => {
        request(app)
        .post('/reset/code/resend')
        .send({
            email: ''
        })
        .then(response => {
            expect(response.status).toBe(400);
            done()
        }).catch(error => done(error))
    });

    it('should reject - not registered email' , done => {
        request(app)
        .post('/reset/code/resend')
        .send({
            email: 'email2@email.com'
        })
        .then(response => {
            expect(response.status).toBe(204);
            done()
        }).catch(error => done(error))
    });
});

describe('POST /reset/confirm', () => {
    const code = generateCode(8);

    before(done => {
        bcrypt.hash(password, 4, (err, hash) => {
            const newUser = new User({ email, password:hash, code });
            newUser.save((error, user) => {
                if (error) done('error pre-adding user');

                // console.log('new user', user)
                done();
            }) 
        });    
    })


    it('should confirm' , done => {
        request(app)
        .post('/reset/confirm')
        .send({
            email,
            code
        })
        .then(response => {
            expect(response.status).toBe(204);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no email' , done => {
        request(app)
        .post('/reset/confirm')
        .send({
            email: '',
            code
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid email' , done => {
        request(app)
        .post('/reset/confirm')
        .send({
            email: 'aadadhasdbadausb',
            code
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no email' , done => {
        request(app)
        .post('/reset/confirm')
        .send({
            code
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid code' , done => {
        request(app)
        .post('/reset/confirm')
        .send({
            email,
            code: 'aaaabbbb'
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no code' , done => {
        request(app)
        .post('/reset/confirm')
        .send({
            email, 
            code: ''
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        }).catch(error => done(error))
    });
});

describe('POST /reset/update', () => {
    const code = generateCode(8);
    const password = 'newPassword1234';

    before(done => {
        bcrypt.hash(password, 4, (err, hash) => {
            const newUser = new User({ email, password:hash, code });
            newUser.save((error, user) => {
                if (error) done('error pre-adding user');

                if (!user) done('error pre-adding user');
                // password = user.password;
                // console.log('new user', user)
                done();
            }) 
        });    
    })

    it('should confirm' , done => {
        request(app)
        .post('/reset/update')
        .send({
            email,
            code,
            password
        })
        .then(response => {
            expect(response.status).toBe(204);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid code' , done => {
        request(app)
        .post('/reset/update')
        .send({
            email,
            code: 'aaaabbbb',
            password
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(error => done(error))
    });

    it('should reject - non existent email' , done => {
        request(app)
        .post('/reset/update')
        .send({
            email: 'email2@email.com',
            code,
            password
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid email' , done => {
        request(app)
        .post('/reset/update')
        .send({
            email: 'a8dnf8ad8n',
            code,
            password
        })
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no password' , done => {
        request(app)
        .post('/reset/update')
        .send({
            email,
            code,
            password: ''
        })
        .then(response => {
            expect(response.status).toBe(400);
            done();
        }).catch(error => done(error))
    });


});