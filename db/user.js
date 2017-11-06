const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SALT_WORK_FACTOR = 10;
process.env.JWT_SECRET = 'mybigfatsecret';

var userSchema = new mongoose.Schema({
 email: {
   type: String,
   required: true,
   unique: true
 },
 password: String,
 tokens: [{
      access: {
        type: String,
        required: true
      },
      token: {
        type: String,
        required: true
      }
    }]
});

userSchema.pre('save', function(next){
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);
      bcrypt.hash(user.password, salt, function(err, hash) {
          if (err) return next(err);
          user.password = hash;
          next();
      });
  });
});


userSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: this._id, access}, process.env.JWT_SECRET);

  user.tokens.push({access, token});

  return user.save()
    .then(() => {
      return token;
    });
}

userSchema.methods.removeToken = function (token){
  var user = this;

  return user.update({
    $pull: {
      tokens: {token}
    }
  });
}

userSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (e) {
    return Promise.reject('Could not verify this token');
  }
  return User.findOne({
    "_id": decoded._id,
    "tokens.access": 'auth',
    "tokens.token": token
  });
}

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var User = mongoose.model("User", userSchema);

module.exports = {
  User
}
