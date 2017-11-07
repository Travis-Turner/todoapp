const {User} = require('./../db/user');


var authenticate = function (req, res, next) {
  var token = req.session.token;
  User.findByToken(token)
    .then((user) => {
      if (!user) {
        req.flash('info', 'You must be logged in to do that.');
        res.redirect("/");
      }
      next();
    })
    .catch((e) => {
      req.flash('info', 'You must be logged in to do that.');
      res.redirect("/");
    });
}

module.exports = {authenticate};
