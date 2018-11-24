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
            expect(response.status).toBe(200)
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

describe('auth GET /login', () => {

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
        .get('/login')
        .set('email', email)
        .set('password', 'wrongpassword')
        .send()
        .then(response => {
            expect(response.status).toBe(401)
            done();
        }).catch(error => done(error))
    });   
    
    it('should reject - non registered email address', done => {
        request(app)
        .get('/login')
        .set('email', 'email2@email.com')
        .set('password', password)
        .send()
        .then(response => {
            expect(response.status).toBe(404)
            done();
        }).catch(error => done(error))
    });    

    it('should login', done => {        
        request(app)
        .get('/login')
        .set('email', email)
        .set('password', password)
        .send()
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body).toHaveProperty('token')
            expect(response.body).toHaveProperty('email')
            expect(response.body).toHaveProperty('id')

            done();
        }).catch(error => done(error))
    })
})

describe('GET /reset/code', () => {
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
        .get('/reset/code')
        .set('email', email)
        .send()
        .then(response => {
            expect(response.status).toBe(200);
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
        .get('/reset/code')
        .set('email', '')
        .send()
        .then(response => {
            expect(response.status).toBe(404);
            done()
        }).catch(error => done(error))
    });

    it('should reject - not registered email' , done => {
        request(app)
        .get('/reset/code')
        .set('email', 'email2@email.com')
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done()
        }).catch(error => done(error))
    });
    
});

describe('GET /reset/code/resend', () => {
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
        .get('/reset/code/resend')
        .set('email', email)
        .send()
        .then(response => {
            expect(response.status).toBe(200);
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
        .get('/reset/code/resend')
        .set('email', '')
        .send()
        .then(response => {
            expect(response.status).toBe(404);
            done()
        }).catch(error => done(error))
    });

    it('should reject - not registered email' , done => {
        request(app)
        .get('/reset/code/resend')
        .set('email', 'email2@email.com')
        .send()
        .then(response => {
            expect(response.status).toBe(401);
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
        .set('email', email)
        .set('code', code)
        .send()
        .then(response => {
            expect(response.status).toBe(200);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no email' , done => {
        request(app)
        .post('/reset/confirm')
        .set('email', '')
        .set('code', code)
        .send()
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid email' , done => {
        request(app)
        .post('/reset/confirm')
        .set('email', 'aadadhasdbadausb')
        .set('code', code)
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no email' , done => {
        request(app)
        .post('/reset/confirm')
        .set('email', 'email2@email.com')
        .set('code', code)
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid code' , done => {
        request(app)
        .post('/reset/confirm')
        .set('email', email)
        .set('code', 'aaaabbbb')
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no code' , done => {
        request(app)
        .post('/reset/confirm')
        .set('email', email)
        .set('code', '')
        .send()
        .then(response => {
            expect(response.status).toBe(404);
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
        .set('email', email)
        .set('code', code)
        .set('password', password)
        .send()
        .then(response => {
            expect(response.status).toBe(200);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid code' , done => {
        request(app)
        .post('/reset/update')
        .set('email', email)
        .set('code', 'aaaabbbb')
        .set('password', password)
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(error => done(error))
    });

    it('should reject - non existent email' , done => {
        request(app)
        .post('/reset/update')
        .set('email', 'email2@email.com')
        .set('code', code)
        .set('password', password)
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(error => done(error))
    });

    it('should reject - invalid email' , done => {
        request(app)
        .post('/reset/update')
        .set('email', 'a8dnf8ad8n')
        .set('code', code)
        .set('password', password)
        .send()
        .then(response => {
            expect(response.status).toBe(401);
            done();
        }).catch(error => done(error))
    });

    it('should reject - no password' , done => {
        request(app)
        .post('/reset/update')
        .set('email', email)
        .set('code', code)
        .set('password', '')
        .send()
        .then(response => {
            expect(response.status).toBe(404);
            done();
        }).catch(error => done(error))
    });


});