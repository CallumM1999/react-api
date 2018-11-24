const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cors());

const mongoose = require('mongoose');
const localURI = 'mongodb://localhost/anki';
const testURI = 'mongodb://localhost/test';

const URL = process.env.TESTING ? testURI : process.env.testURI || process.env.MONGODB_URI || localURI;

mongoose.connect(testURI, { useNewUrlParser: true }); 

app.use(require('./routes/decks'));
app.use(require('./routes/cards'));
app.use(require('./routes/auth'));

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

module.exports = { app };