let http = require('http');
let dotenv = require('dotenv');
let express = require('express');

dotenv.config();
let app = express();
app.set('view engine', 'ejs');
http.createServer(app).listen(1234);








// Main page
app.get('/', (request, response) => {
    console.log(request.url);
    response.render("index");
});

app.get('/registrationForm', (request, response) => {
    console.log(request.url);
    response.render("registrationForm");
});

app.get('/search', (request, response) => {
    console.log(request.url);
    response.render("search");
});

