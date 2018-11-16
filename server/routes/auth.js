const bcrypt = require('bcrypt');
const bcrypt_rounds = 4;
const generateToken = require('../generateToken');
const transporter = require('../mail/transporter');

const template_forgot = require('../mail/templates/forgot');
const template_verify = require('../mail/templates/verify');

const User = require('../mongoose/models/User');

module.exports = (app, mongoose) => {   

    // 401 unauthorized
    app.get('/login', (req, res) => {
        // console.log('login request')
        const { email, password } = req.headers;

        if (!email || !password) return res.status(401).send();
        
        User.findOne({ email }, (err, user) => {
            if (err || !user) return res.status(401).send();
            
            const tokenData = {
                email: user.email,
                id: user._id
            };

            bcrypt.compare(password, user.password, (err, match) => {
                if (err) return res.status(401).send();
                
                if (match) {
                    const token = generateToken(tokenData);
                    return res.status(200).json({
                        token,
                        ...tokenData
                    });
                }
                res.status(401).send();
            });
        }); 
    });

    app.post('/register', (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) return res.status(400).send();
        
        User.findOne({ email }, (err, user) => {
            if (err) return res.status(400).send();
            if (user) return res.status(202).send(); // email already exists


            bcrypt.hash(password, bcrypt_rounds, (err, output) => {
                const newUser = new User({ 
                    email, 
                    password: output
                });

                newUser.save((err, newUser) => {
                    if (err) return res.status(400).send();

                    const tokenData = {
                        email: newUser.email,
                        id: newUser._id
                    };

                    const token = generateToken(tokenData);
 
                    transporter.sendMail(template_verify(email), (error, info) => {
                        // if (error) return res.status(408).send();
                        // res.status(200).send();
                    });

                   return res.status(201).json({ // 201 created
                        token,
                        ...tokenData
                    });
                });
            });      
        });
    });

    // generate code
    app.get('/reset/code', (req, res) => {
        const { email } = req.headers;

        if (!email) return res.status(404).send();

        const code = String(Math.floor(Math.random() * 1000000)); // 6 digits

        // add code to user in database
        User.findOneAndUpdate({ email }, { code }, (err, user) => {
            if (err) return res.status(400).send();
            if (!user) return res.status(404).send();

            transporter.sendMail(template_forgot(email, code), (error, info) => {
                if (error) return res.status(408).send();
                
                res.status(200).send();
            });
        });
    });
    
    // resend code
    app.get('/reset/code/resend', (req, res) => {
        const { email } = req.headers;

        if (!email) return res.status(404).send();

        User.findOne({ email }, (err, user) => {
            if (err) return res.status(400).send();
            if (!user) return res.status(404).send();
        
            const { code } = user;

            transporter.sendMail(template_forgot(email, code), (error, info) => {
                if (error) return res.status(408).send();
                res.status(200).send();
            });
        });
    });

    // confirm code
    app.post('/reset/confirm', (req, res) => {
        const { email, code } = req.headers;

        if (!email || !code) return res.status(404).send();

        User.findOne({ email, code }, (err, user) => {
            if (err) return res.status(400).send();
            if (!user) return res.status(404).send();
            
            res.status(200).send();
        });
    });

    app.post('/reset/update', (req, res) => {
        const { email, code, password } = req.headers;

        if (!email || !code || !password) return res.status(404).send();


        bcrypt.hash(password, bcrypt_rounds, (err, output) => {
            
            User.findOneAndUpdate({ email, code }, { password: output, code: null }, (err, user) => {
                if (err) return res.status(400).send();
                if (!user) return res.status(404).send();
    
                res.status(200).send();
            });

        });   

    });
};