const bcrypt = require('bcrypt');
const bcrypt_rounds = 4;
const validator = require('validator');

const generateToken = require('../generateToken');

const template_forgot = require('../mail/templates/forgot');
const template_verify = require('../mail/templates/verify');

const User = require('../mongoose/models/User');


const findUser = require('../mongoose/methods/User/findUser');
const registerUser = require('../mongoose/methods/User/registerUser');
const findUserAndUpdate = require('../mongoose/methods/User/findUserAndUpdate');

const sendEmail = require('../mail/methods/sendEmail');

module.exports = (app, mongoose) => {   

    // 401 unauthorized
    app.get('/login', (req, res) => {

        const { email, password } = req.headers;
        const normalizedEmail = validator.normalizeEmail(email);

        if (!email || !password) return res.status(401).send();

        async function login(email, password) {
            const user = await findUser({ email });
            if (!user) return res.status(401).send('user doesn\' exist');
    
            const tokenData = { email, id: user._id };
    
            const match = await bcrypt.compareSync(password, user.password);
            if (!match) return res.status(401).send('invalid password');
    
            const token = generateToken(tokenData);
    
            return res.status(200).json({
                token,
                ...tokenData
            });
        }

        login(normalizedEmail, password)
        .catch(error => console.log('/register error', error));
    });

    app.post('/register', (req, res) => {
        console.log('POST/ register')
        const { email, password } = req.body;
        const normalizedEmail = validator.normalizeEmail(email);

        if (!email || !password) return res.status(400).send();

        async function register(email, password) {
            const user = await findUser({ email });
            if (user) return res.status(401).send(`The email ${email} exists!`);
        
            const hash = await bcrypt.hashSync(password, bcrypt_rounds);
            if (!hash) return res.status(500).send('error generating hash');
        
            const registeredUser = await registerUser(email, hash);
            if (!registerUser) return res.status(500).send('user not added');
        
            const tokenData = { email, id: registeredUser._id };
            const token = generateToken(tokenData);

            res.status(200).json({ token, ...tokenData })
        }

        register(normalizedEmail, password)
        .catch(error => console.log('/register error', error));
    });

    // generate code
    app.get('/reset/code', (req, res) => {

        const { email } = req.headers;

        const normalizedEmail = validator.normalizeEmail(email);

        if (!email) return res.status(404).send();

        async function resetCode(email) {
            const code = String(Math.floor(Math.random() * 1000000)); // 6 digits

            // add code to user in database
            const foundUser = await findUserAndUpdate({ email }, { code });
            if (!foundUser)return res.status(404).send();
     
            const emailSent = await sendEmail(template_forgot(email, code));
            if (!emailSent) return res.status(408).send();
    
            res.status(200).send();
        }

        resetCode(normalizedEmail)
        .catch(error => console.log('/register error', error));
    });
    
    // resend code
    app.get('/reset/code/resend', (req, res) => {            const code = String(Math.floor(Math.random() * 1000000)); // 6 digits

        const { email } = req.headers;
        const normalizedEmail = validator.normalizeEmail(email);
        if (!email) return res.status(404).send();

        async function resend(email) {
            const user = await findUser({ email });
            if (!user) return res.status(401).send('user not found');
    
            const { code } = user;

            const emailSent = await sendEmail(template_forgot(email, code));
            if (!emailSent) return res.status(408).send();

            res.status(200).send();
        }

        resend(normalizedEmail)
        .catch(error => console.log('/register error', error));
    });

    // confirm code
    app.post('/reset/confirm', (req, res) => {
        const { email, code } = req.headers;
        const normalizedEmail = validator.normalizeEmail(email);

        if (!email || !code) return res.status(404).send();

        async function confirm(email, code) {
            const foundUser = await findUser({ email, code });
            if (!foundUser) return res.status(404).send('user not found');
            res.status(200).send();
        }

        confirm(normalizedEmail, code)
        .catch(error => console.log('/register error', error)); 
    });

    app.post('/reset/update', (req, res) => {
        const { email, code, password } = req.headers;

        if (!email || !code || !password) return res.status(404).send();

        const normalizedEmail = validator.normalizeEmail(email);

        async function update(email, code, password) {
            const hash = await bcrypt.hashSync(password, bcrypt_rounds);
            if (!hash) return res.status(500).send('error generating hash');

            const updatedUser = await findUserAndUpdate({email, code}, {password:hash, code:null});
            if (!updatedUser) return res.status(400).send('error updating user');

            res.status(200).send();
        }

        update(normalizedEmail, code, password)
        .catch(error => console.log('/register error', error)); 

    });
};