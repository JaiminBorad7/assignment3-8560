const { Roles } = require("./roles");
const { Routes } = require("./Routes");

module.exports.isUser = (req, res, next) => {
  const user = req.user;
  if(user && user.role !== Roles.USER) {
    req.flash("message", "You must be registered as user to access this resource");
    res.redirect(Routes.home);
  } else {
    next();
  }
}