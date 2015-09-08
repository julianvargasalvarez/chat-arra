process.env.PORT = 3000
process.env.NODE_ENV = 'test'

var server = require('../../app');
var supertest = require('supertest');
var request = supertest(server);
var expect = require('chai').expect;
var User = require('../../models/user');

describe('Login into chat-arra', function(){
  before(function(done){
    var user = new User({email:'myuser@gmail.com', password:'12345'})
    user.save(function(error, ok){
      done();
    })
  })

  it('should existing users to login', function(done){
    request
      .post('/login')
      .send({username:'david', password:'badPassword'})
      .expect(401)
      .end(done)
  })

  it('should authenticate valid credentials', function(done){
    request
    .post('/login')
    .send({username:'david', password:'password'})
    .expect(200)
    .end(function(err, res){
      if (err) return done(err)
      expect(res.body).to.have.property('token')
      done()
    })
  })

  after(function(done){
    User.findByUsername('david', function(error, user){
      user.delete(function(error, ok){
        done()
      })
    })
  })
})
