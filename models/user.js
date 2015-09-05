var crypto = require('crypto');
var jsonschema = require('jsonschema');

var rtg = require('url').parse(process.env.REDISTOGO_URL)
var redis = require('redis').createClient(rtg.port, rtg.hostname)

var userSchema = {
  title: 'User schema',
  type: 'Object',
  properties: {
    email: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  },
  required: ['email', 'password']
}

/**
 * Hasher function to calculate password hash
 * @param  {[String]} password
 * @param  {[Sting]}  salt
 * @return {[Sting]}  Hash
 */
function hasher (password, salt) {
  var hash = crypto.createHash('sha512')
  hash.update(password)
  hash.update(salt)
  return hash.digest('base64')
}

function User(user){
  try{
    jsonschema.validate(user, userSchema, { throwError: true })
  } catch(e){
    throw new jsonschema.SchemaError(e)
  }

  this.email = user.email
  this.salt = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5)
  this.password = hasher(user.password, this.salt)

  return this
}

User.prototype.save = function(next){
  var self = this
  redis.hgetall('users-'+self.email, function(error, user){
    if(error){ return next(error) }
    if(user){ return next(new Error('duplicated')) }
    redis.hmset('users-'+self.email, self, next)
  })
}

User.prototype.isValid = function(password){
  return hasher(password, this.salt) === this.password
}

User.find = function(email, next){
  redis.hgetall('users-'+email, function(error, user){
    if(error) { next(error) }
    if(user) {
      user.__proto__ = User.prototype
      next(null, user)
    } else {
      next(null, null)
    }
  })
}

module.exports = User
