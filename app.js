const express = require('express');
const exphbs  = require('express-handlebars');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const _ = require('lodash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('connect-flash');

const methodOverride = require('method-override');

const {port} = require('./config');
const {mongoose} = require('./db/mongoose');
const {User} = require('./db/user');
const {Todo} = require('./db/todo');
const {authenticate} = require('./middleware/authenticate');
const {locals} = require('./middleware/locals');

var app = express();

// VIEW ENGINE
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use("/public", express.static(__dirname + '/public'));

// MIDDLEWARE
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

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

app.get('/secret', (req, res) => {
  res.send('secret page');
});

// REGISTER ROUTES ----------------------------
app.get('/register', (req, res) => {
  res.status(200).render('register');
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

// LOGIN ROUTES ----------------------------
app.get("/login", (req, res) => {
  res.render('login');
});

app.post("/login", (req, res) => {
  var userObj = _.pick(req.body, ['email', 'password']);
  User.findOne({ email: userObj.email }).then((user) => {
      user.comparePassword(userObj.password, function(err, isMatch) {
          if (isMatch) {
            user.generateAuthToken().then((token) => {
              req.session.token = token;
              req.flash('info', 'Successfully logged in!');
              res.redirect("/");
            })
            /* --- --- --- STORE TOKEN IN SESSION --- --- --- */
          } else {
            req.flash('info', 'Log in failed.  Please try again.');
            res.redirect("/login");
          }
      });
  }).catch((e) => {
    req.flash('An unknown error occurred.  Please try again.');
    res.redirect("/");
  });
});

//LOGOUT

app.get('/logout', (req, res) => {
  var token = req.session.token;
  User.findByToken(token).then((user) => {
    user.removeToken(token).then((user) => {
      req.session.token = "";
      req.session.destroy;
      req.flash('info', 'Logged out.');
      res.redirect("/");
    });
  }).catch((e) => {
    req.flash('An unknown error occurred.  Please try again.');
    res.redirect("/");
  });
});

// TODOS ROUTES ----------------------------
app.get('/todos', (req, res) => {
  Todo.find({}).then((todos) => {
    completedTodos = todos.filter(function(item){
      return item.completed === true;
    });
    todos = todos.filter(function(item){
      return item.completed === false;
    });

    let data = {
      locals: {
        todos,
        completedTodos
      }
    }
    res.status(200).render('todos', data);
  });
});

app.post('/todos', (req, res) => {
  var todo = _.pick(req.body, ['text']);
  var now = new Date();
  var milliseconds = now.getMilliseconds();
  todo.startedAt = milliseconds;
  var newTodo = new Todo(todo);

  newTodo.save().then((todo) => {
    res.redirect('/todos');
  }).catch((err) => {
    res.send(err);
  });
});

app.get('/todos/:id', (req, res) => {
  res.send(req.params.id);
});

app.put('/todos/:id', (req, res) => {
  Todo.findOne({_id: req.params.id}).then((todo) => {
    todo.completed = true;
    todo.save();
    res.redirect('/');
  })
  .catch((e) => {
    console.log(e);
  });
});

app.delete('/todos/:id', (req, res) => {
  Todo.findOne({_id: req.params.id}).then((todo) => {
    todo.remove();
    res.redirect('/');
  })
  .catch((e) => {
    console.log(e);
  })
})



app.listen(port, () => {
  console.log('Server is running on ' + port);
});
