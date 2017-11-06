const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const {port} = require('./config');
const {mongoose} = require('./db/mongoose');
const {User} = require('./db/user');

var app = express();

// VIEW ENGINE
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use("/public", express.static(__dirname + '/public'));

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(expressValidator());

// SESSION
app.use(cookieParser());
app.use(session({
  secret: 'mybigsecret',
  resave: true,
  saveUninitialized: false,
}));
app.use(flash());

// ROOT ROUTE ----------------------------
app.get('/', (req, res) => {
  res.redirect('/todos');
});

// REGISTER ROUTES ----------------------------
app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  if (req.body.email && req.body.password){
    //validate fields
    req.assert('email', 'Is valid email').isEmail();
    req.assert('password', 'Is not empty').notEmpty();

    var errors = req.validationErrors();
    if (errors){
      req.flash('info', 'Registation failed.  Please try again.');
      res.redirect("/register");
    }
    //pick relevant properties into seperate object
    var userObj = _.pick(req.body, ['email', 'password']);
    var newUser = new User(userObj);
    //save user
    newUser.save().then((user) => {
      req.flash('info', 'Registation was a success!');
      res.send(user);
    }).catch((e) => {
      req.flash('info', 'User with that ID already exists.  Please try again.');
      res.redirect("/register");
    });
  } else {
    req.flash('info', 'Registration failed.  Please try again.');
    res.redirect("/register");
  }
});

// TODOS ROUTES ----------------------------
app.get('/todos', (req, res) => {
  res.status(200).send('hello');
});



app.listen(port, () => {
  console.log('Server is running on ' + port);
});
