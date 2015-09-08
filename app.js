var express = require('express');
var app = express();
var http = require('http').Server(app);
var jsonWebToken = require('jsonwebtoken')
var User = require('./models/user');
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
    if(error){ return next(error) }
    if(!user){ return res.redirect('/') }

    if(user.isValid(req.body.password)){

      req.session.user = user;
      req.session.token = jsonWebToken.sign(user, process.env.SECRET, { expiresInMinutes: 60 });

      return res
      .status(302)
      .redirect('/chat-room');

    } else {
      return res.status(401).redirect('/')
    }
  })
});

app.post('/sign-up', function(req, res, next) {
  User.find(req.body.email, function(error, user){
    if(error){ return next(error) }
    if(user){ return res.redirect('/') }

    var user = new User(req.body)

    user.save(function(error, ok){
      if(error) { return next(error) }

      delete user.password
      delete user.salt

      req.session.user = user;
      req.session.token = jsonWebToken.sign(user, process.env.SECRET, { expiresInMinutes: 60 });

      return res
      .status(302)
      .redirect('/chat-room');
    })
  })
});

app.get('/chat-room', function(req, res, next) {
  return res.render('chat-room.jade', {user: JSON.stringify(req.session.user), token: req.session.token});
});

http.listen(app.get('port'), function(){
  socket(http);
});

function createToken(user) {
  return jsonWebToken.sign(user, process.env.SECRET, { expiresInMinutes: 60 })
}

module.exports = app;
