const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
        user: 'callum.macpherson.apps@gmail.com',
        pass: 'M52YsWT$!W1KCPshF^LwgSjuCKlnQO09bwxZLzN!5$N@iw*HFcjqHGWthfv*!^b1rSqKZ12fKSvxYLAQasMts12bE##Oc9vF^01Q'
    },
    tls: {
        rejectUnauthorized: false
    }
});

module.exports = transporter;