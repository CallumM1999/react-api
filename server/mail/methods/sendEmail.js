const transporter = require('../transporter');



const sendEmail = template => {
    return new Promise((resolve, reject) => {
        transporter.sendMail(template, (error, info) => {

            console.log(process.env.EMAIL_USERNAME, process.env.EMAIL_PASSWORD)

            console.log('sendemail', error);
            console.log('sendemail', info);

            if (error) reject(new Error(error));
            resolve(info);
        });
    });
}

module.exports = sendEmail;