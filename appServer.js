let http = require('http');
let express = require('express');
let bodyParser = require('body-parser');


let app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
http.createServer(app).listen(1234);

// MongoDB setup
require('dotenv').config();
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;
const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = `mongodb+srv://${userName}:${password}@cluster0.ghxta.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1});




// Main page
app.get('/', (request, response) => {
    response.render("index");
});

// Registration page
app.get('/registrationForm', (request, response) => {
    response.render("registrationForm");
});
app.post('/registrationForm', (request, response) => {
    let {name, address, username, textbook_name, price, isbn, desc_of_cond} = request.body;
    let variables = {
        name: name,
        isbn: isbn,
        price: price,
        address: address,
        username: username,
        desc_of_cond: desc_of_cond,
        textbook_name: textbook_name,
    }

    response.render("processForm", variables);
})

// Search page
app.get('/search', (request, response) => {
    response.render("search");
});

