var collar = require("collar.js");

var backend = require("./backend");

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

app.post("/login", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  backend.login({
    event : "auth",
    username : username,
    password : password
  }, (err, result) => {
    if (err) {
      res.status(401).end(err.message);
      return;
    }
    res.json(result);
  });
});

app.get("/greeting", (req, res) => {
  var token = req.headers['x-access-token'];

  backend.greeting({
    event : "greeting",
    token : token
  }, (err, result) => {
    if (err) {
      res.status(401).end(err.message);
      return;
    }
    res.json(result);
  })
});

app.listen(port);
console.log('Magic happens on port ' + port);
