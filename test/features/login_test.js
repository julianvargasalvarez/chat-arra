process.env.NODE_ENV = 'test';
var app = require('../../app');
var http = require('http');
var assert = require('assert');
var Browser = require('zombie');
var User = require('../../models/user');

describe('contact page', function() {

  before(function(done) {
    this.server = http.createServer(app).listen(5000);
    this.browser = new Browser({ site: 'http://localhost:5000' });
    var user = new User({email:'user@gmail.com', password:'123'});
    return user.save(function(err, success) { console.log("el resultado", err, success); return done(); });
  });

  beforeEach(function(done) {
    this.browser.visit('/', done);
  });

  it('should show the login form', function() {
    assert.ok(this.browser.success);
  });

  it('should refuse empty submissions', function(done) {
    var browser = this.browser;
    browser.pressButton('Log in').then(function() {
      assert.ok(browser.success);
      browser.assert.url('http://localhost:5000/');
    }).then(done, done);
  });

  it('should allow registered users to log in', function(done) {
    var browser = this.browser;
    
    browser.fill('email', 'user@gmail.com');
    browser.fill('password', '123');

    browser.pressButton('Log in').then(function() {
      assert.ok(browser.success);
      browser.assert.url('http://localhost:5000/chat-room');
    }).then(done, done);
  });

  it('should not allow wrong credentials to log in', function(done) {
    var browser = this.browser;
    
    browser.fill('email', 'user@gmail.com');
    browser.fill('password', '123');

    browser.pressButton('Log in').then(function() {
      assert.ok(browser.success);
      browser.assert.url('http://localhost:5000/');
    }).then(done, done);
  });

  after(function(done) {
    return done();
  });

});
