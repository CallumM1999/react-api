const nodemailer = require('nodemailer');
let auth;

try {
    auth = require('../../conf.json'); 
} catch(e) {
    auth = {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
}

let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth,
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;