const transporter = require('../transporter');

const sendEmail = template => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(template, (error, info) => {
            if (error) reject(new Error(error));
            resolve(info);
        });
    });
}

module.exports = sendEmail;