var locals = function (req, res, next){
  if (req.session.token){
    res.locals.user = true;
  }
  next();
}

module.exports = {locals};
