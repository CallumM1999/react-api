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

router.get('/login', asyncMiddleware(async (req, res, next) => {
    const { email, password } = req.headers;
    if (!email || !password) return res.status(401).send();

    const normalizedEmail = validator.normalizeEmail(email);

    const user = await findUser({ email: normalizedEmail });
    if (!user) return res.status(404).send();

    const tokenData = { email: normalizedEmail, id: user._id };

    const match = await bcrypt.compareSync(password, user.password);
    if (!match) return res.status(401).send();

    const token = generateToken(tokenData);

    return res.status(200).json({
        token,
        ...tokenData
    });
}));

router.post('/register', asyncMiddleware(async (req, res, next) => {
    const { email, password } = req.body;
    const normalizedEmail = validator.normalizeEmail(email);

    if (!email || !password) return res.status(400).send();
    if (!validator.isEmail(email)) return res.status(400).send();

    const user = await findUser({ email: normalizedEmail });
    if (user) return res.status(401).send();

    const hash = await bcrypt.hashSync(password, bcrypt_rounds);
    if (!hash) return res.status(500).send();

    const registeredUser = await registerUser(normalizedEmail, hash);
    if (!registerUser) return res.status(500).send();

    const tokenData = { email: normalizedEmail, id: registeredUser._id };
    const token = generateToken(tokenData);

    res.status(200).json({ token, ...tokenData })
}));


// generate code
router.get('/reset/code', asyncMiddleware(async (req, res, next) => {

    const { email } = req.headers;

    const normalizedEmail = validator.normalizeEmail(email);

    if (!email) return res.status(404).send();

    const code = generateCode(8);

    // add code to user in database
    const foundUser = await findUserAndUpdate({ email: normalizedEmail }, { code });
    if (!foundUser)return res.status(401).send();

    const emailSent = await sendEmail(template_forgot(normalizedEmail, code));
    if (!emailSent) return res.status(408).send();

    res.status(200).send();
    
}));

// resend code
router.get('/reset/code/resend', asyncMiddleware(async (req, res, next) => {            
    
    const { email } = req.headers;
    const normalizedEmail = validator.normalizeEmail(email);
    if (!email) return res.status(404).send();

    const user = await findUser({ email: normalizedEmail });
    if (!user) return res.status(401).send('user not found');

    const { code } = user;

    const emailSent = await sendEmail(template_forgot(normalizedEmail, code));
    if (!emailSent) return res.status(408).send();

    res.status(200).send();
    
}));

// confirm code
router.post('/reset/confirm', asyncMiddleware(async (req, res, next) => {
    const { email, code } = req.headers;
    const normalizedEmail = validator.normalizeEmail(email);

    if (!email || !code) return res.status(404).send();

    const foundUser = await findUser({ email: normalizedEmail, code });
    if (!foundUser) return res.status(401).send('user not found');
    res.status(200).send();
}));

router.post('/reset/update', asyncMiddleware(async (req, res, next) => {
    const { email, code, password } = req.headers;

    if (!email || !code || !password) return res.status(404).send();

    const normalizedEmail = validator.normalizeEmail(email);

    const hash = await bcrypt.hashSync(password, bcrypt_rounds);
    if (!hash) return res.status(500).send('error generating hash');

    const updatedUser = await findUserAndUpdate({email: normalizedEmail, code}, {password:hash, code:null});
    if (!updatedUser) return res.status(401).send('error updating user');

    res.status(200).send();
    

}));

module.exports = router;