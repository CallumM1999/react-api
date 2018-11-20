const bcrypt = require('bcrypt');
const bcrypt_rounds = 4;
const validator = require('validator');

const generateToken = require('../server/generateToken');
const transporter = require('../server/mail/transporter');

const template_forgot = require('../server/mail/templates/forgot');
const template_verify = require('../server/mail/templates/verify');

const mongoose = require('mongoose');

const localURI = 'mongodb://localhost/anki';

mongoose.connect(process.env.MONGODB_URI || localURI, { useNewUrlParser: true }); 


const User = require('../server/mongoose/models/User');

const emailExists = (email) => {
    return new Promise((resolve, reject) => {
        User.findOne({ email })
        .exec((error, user) => {
            if (error) return reject(new Error({ error }));
            resolve(user);
        });
    });
}

const registerUser = (email, password) => {
    return new Promise((resolve, reject) => {
        const newUser = new User({ email, password });

        newUser.save((error, user) => {
            if (error) reject(new Error(error));
            resolve(user);
        }) 
    });
};

const sendEmail = (template) => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(template, (error, info) => {
            if (error) reject(new Error(error));
            resolve(info);
        });
    });
}
    

async function register(email, password) {

    if (!email) return console.log('no email');
    if (!password) return console.log('no password');

    const user = await emailExists(email);
    if (user) return console.log(`The email ${email} exists!`);

    const hash = await bcrypt.hashSync(password, bcrypt_rounds);
    if (!hash) return console.log('error generating hash');

    const registeredUser = await registerUser(email, password);
    if (!registerUser) return console.log('user not added');

    // const emailSent = await sendEmail(template_forgot(email));
    // if (!emailSent) return console.log('email not sent');

    const tokenData = {
        email,
        id: registeredUser._id
    };

    const token = generateToken(tokenData);

    console.log('response', { token, ...tokenData })
}

register('email17@email.com', 'password1234').catch(error => {
    console.log('register error');
    console.log(error);
});