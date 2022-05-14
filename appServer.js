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
const db = process.env.MONGO_DB;
const collection = process.env.MONGO_COLLECTION;
const {MongoClient, ServerApiVersion} = require('mongodb');
const { text } = require('body-parser');
const uri = `mongodb+srv://${userName}:${password}@cluster0.ghxta.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1});

// Amazon Api setup
const axios = require('axios');
const { resourceLimits } = require('worker_threads');
const params = {
    api_key: process.env.API_KEY,
    type: "search",
    amazon_domain: "amazon.com",
    search_term: ""
}





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
    insertTextbook(client, db, collection, variables);
    response.render("processForm", variables);
})

// Search page
app.get('/search', (request, response) => {
    response.render("search");
});
app.post('/search', (request, response) => {
    let {isbn} = request.body;
    findTextbook(client, db, collection, isbn).then(res => {
        // console.log(res);

        let variables = {
            bookOnShelf: writeToList(res),
            amazonItem: ""
        };

        params.search_term = `isbn ${isbn}`;

        axios.get('https://api.rainforestapi.com/request', {params})
        .then(res => {
            let item = res.data.search_results[0];
            let title = item.title;
            let isbn = item.asin;
            let price = item.price.raw;
            let link = item.link;
            let img = item.image;

            variables.amazonItem = writeToAmazonFormat(title, isbn, price, link, img);

            response.render("processSearch", variables);

        }).catch(error => {
            console.log(error);
            console.log("fuck");
        })

        

    });
});
    








async function insertTextbook(client, db, collection, record) {

    try {
        await client.connect();

        let id = await client.db(db)
                             .collection(collection)
                             .insertOne(record);
        
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }

}

async function findTextbook(client, db, collection, isbn) {

    try {
        await client.connect();
        let target = {isbn: isbn};

        const cursor = await client.db(db)
                             .collection(collection)
                             .find(target);

        const res = await cursor.toArray();
        return res;
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }    

}

function writeToList(lstOfBook) {
    res = "<ol>";
    lstOfBook.forEach(element => {

        let {name, address, textbook_name, price} = element;
        let searchRes = searchResult(name, address, textbook_name, price);
        res += `<li>${searchRes}</li>`;
        
    });

    res += "</ol>";
    return res;
}

function searchResult(username, email, title, price) {

    return `<strong>Seller's Name: </strong> ${username}<br>
            <strong>Seller's Email: </strong>${email}<br>
            <strong>Textbook: </strong>${title}<br>
            <strong>Price: $</strong>${price}<br>`

}

function writeToAmazonFormat(title, isbn, price, link, img) {
    return `<img src="${img}" alt="img on Amazon"><br>
            <strong>Title: </strong> <a href="${link}">${title}</a><br>
            <strong>ISBN: </strong>${isbn}<br>
            <strong>Price: </strong>${price}<br><br>`;
}