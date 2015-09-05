var express = require('express');
var app = express();
var http = require('http').Server(app);
var jsonWebToken = require('jsonwebtoken')
var User = require('./models/user')
var bodyParser = require('body-parser');
var session = require('express-session');
var env = require('dotenv');
var cors = require('cors');
var jwt = require('express-jwt');
var socket = require('./socket');

env.load();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(session({secret: process.env.SECRET, resave: true, saveUninitialized: true}));
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.set('port', process.env.PORT || 3000);

app.get('/', function(req, res, next) {
  return res.render('index.jade');
});

app.get('/sign-up', function(req, res, next) {
  return res.render('sign-up.jade');
});

app.post('/login', function(req, res, next) {
  User.find(req.body.email, function(error, user){
    if(user.isValid(req.body.password)){
      return res
      .status(302)
      .redirect('/chat-room');
    }
  })
});

app.post('/sign-up', function(req, res, next) {
  User.find(req.body.email, function(error, user){
    var user = new User(req.body)
    user.save(function(error, ok){
      if(error) { return next(error) }
      return res
      .status(302)
      .redirect('/chat-room');
    })
  })
});

app.get('/chat-room', function(req, res, next) {
  return res.render('chat-room.jade');
});

http.listen(app.get('port'), function(){
  socket(http);
});

module.exports = app;
