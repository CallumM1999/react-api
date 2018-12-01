const express = require('express');
const router = express.Router();

const bcrypt = require('bcrypt');
const bcrypt_rounds = 4;
const validator = require('validator');

const generateToken = require('../generateToken');
const generateCode = require('../utils/generateCode');

const findUser = require('../mongoose/methods/User/findUser');
const registerUser = require('../mongoose/methods/User/registerUser');
const findUserAndUpdate = require('../mongoose/methods/User/findUserAndUpdate');

const sendEmail = require('../mail/methods/sendEmail');
const template_forgot = require('../mail/templates/forgot');

const asyncMiddleware = require('../middleware/asyncMiddleware');

router.post('/login', asyncMiddleware(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Missing email or password');

    const normalizedEmail = validator.normalizeEmail(email);

    const user = await findUser({ email: normalizedEmail });
    if (!user) return res.status(401).send('Auth failed');

    const tokenData = { email: normalizedEmail, id: user._id };

    const match = await bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).send('Auth failed');

    const token = generateToken(tokenData);

    return res.status(200).json({
        token,
        ...tokenData
    });
}));

router.post('/register', asyncMiddleware(async (req, res, next) => {
    const { email, password } = req.body;
    const normalizedEmail = validator.normalizeEmail(email);

    if (!email || !password) return res.status(400).send('Missing email or password');
    if (!validator.isEmail(email)) return res.status(400).send('Email is invalid');

    const user = await findUser({ email: normalizedEmail });
    if (user) return res.status(409).send('Email already taken');

    const hash = await bcrypt.hashSync(password, bcrypt_rounds);
    if (!hash) return res.status(401).send('Auth failed');

    const registeredUser = await registerUser(normalizedEmail, hash);
    if (!registerUser) return res.status(500).send('Error adding user');

    const tokenData = { email: normalizedEmail, id: registeredUser._id };
    const token = generateToken(tokenData);

    res.status(201).json({ token, ...tokenData })
}));


// generate code
router.post('/reset/code', asyncMiddleware(async (req, res, next) => {

    const { email } = req.body;

    if (!email) return res.status(400).send('Missing email field');

    const normalizedEmail = validator.normalizeEmail(email);

    const code = generateCode(8);

    // add code to user in database
    const foundUser = await findUserAndUpdate({ email: normalizedEmail }, { code });
    if (!foundUser) return res.status(204).send(); // user doesn't need to know if email address exists

    const emailSent = await sendEmail(template_forgot(normalizedEmail, code));
    if (!emailSent) return res.status(500).send('Failed to send email');

    res.status(204).send();
    
}));

// resend code
router.post('/reset/code/resend', asyncMiddleware(async (req, res, next) => {            
    
    const { email } = req.body;

    if (!email) return res.status(400).send('Missing email field');

    const normalizedEmail = validator.normalizeEmail(email);

    const user = await findUser({ email: normalizedEmail });
    if (!user) return res.status(204).send(); // user doesn't need to know if email address exists

    const { code } = user;

    const emailSent = await sendEmail(template_forgot(normalizedEmail, code));
    if (!emailSent) return res.status(500).send('Failed to send email');

    res.status(204).send();
    
}));

// confirm code
router.post('/reset/confirm', asyncMiddleware(async (req, res, next) => {
    const { email, code } = req.body;

    if (!email || !code) return res.status(400).send('Missing email and or code fields.');
    const normalizedEmail = validator.normalizeEmail(email);

    const foundUser = await findUser({ email: normalizedEmail, code });
    if (!foundUser) return res.status(404).send('Code is incorrect');
    res.status(204).send();
}));

router.post('/reset/update', asyncMiddleware(async (req, res, next) => {
    const { email, code, password } = req.body;

    if (!email || !code || !password) return res.status(400).send('Missing email, password and or code fields.');

    const normalizedEmail = validator.normalizeEmail(email);

    const hash = await bcrypt.hashSync(password, bcrypt_rounds);
    if (!hash) return res.status(500).send('error generating hash');

    const updatedUser = await findUserAndUpdate({email: normalizedEmail, code}, {password:hash, code:null});
    if (!updatedUser) return res.status(404).send('error updating user');

    res.status(204).send();
    

}));

module.exports = router;