const { Routes } = require("./Routes");

module.exports.isLoggedIn = (req, res, next) => {
  const user = req.user;
  if(!user) {
    console.log('here');
    req.flash("message", "Please login to continue!");
    res.redirect(Routes.login);
  } else {
    next();
  }
}