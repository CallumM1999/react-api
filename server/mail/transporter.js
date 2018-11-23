const nodemailer = require('nodemailer');

const auth = require('../../conf.json');

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