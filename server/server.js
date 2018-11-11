const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');

const PORT = process.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())


app.use(cors());

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/anki', { useNewUrlParser: true })     


// routes
require('./routes/decks')(app, mongoose);
require('./routes/cards')(app, mongoose);
require('./routes/auth')(app, mongoose);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));