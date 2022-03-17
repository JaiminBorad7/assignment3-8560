const { Roles } = require("./roles");
const { Routes } = require("./Routes");

module.exports.isSellerOrAgent = (req, res, next) => {
  const user = req.user;
  if(user && user.role !== Roles.SELLER && user.role !== Roles.AGENT) {
    req.flash("message",  "Youm must be a seller or agent to access this resource.");
    res.redirect(Routes.home);
  } else {
    next();
  }
}