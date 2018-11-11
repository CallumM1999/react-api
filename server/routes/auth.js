const bcrypt = require('bcrypt');
const bcrypt_rounds = 4;
const generateToken = require('../generateToken');

module.exports = (app, mongoose) => {

    const User = mongoose.model('user', { 
        name: String, 
        age: Number, 
        email: String, 
        password: String,
        confirmed: {
            type: Boolean,
            default: false
        },
        confirmationCode: String,
     }
    );

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
            }

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
            })
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
                    password: output, 
                    confirmationCode: 'a6sd6a6dtasdbsad' 
                });

                newUser.save((err, newUser) => {
                    if (err) return res.status(400).send();

                    const tokenData = {
                        email: newUser.email,
                        id: newUser._id
                    }

                    const token = generateToken(tokenData);

                    res.status(201).json({ // 201 created
                        token,
                        ...tokenData
                    });
                });
            });      
        });
    });

    app.get('/reset', (req, res) => {
        res.json({
            message: 'reset function not built yet!'
        });
    })
}