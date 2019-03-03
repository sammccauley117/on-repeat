var express = require('express');
var cors    = require('cors');
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser")
var fs = require('fs');
var stream = require('stream');
var requests = require('./requests/_requests');

var app = express();
app.use(express.static(__dirname + '/app'))
app.use(cors())
   .use(cookieParser())
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: true }));

app.get('/login', requests.login);
app.get('/callback', requests.callback);

const server = app.listen(process.env.PORT || 8080, () => {
  const port = server.address().port;
  console.log(`App listening on port ${port}`);
});
