module.exports.isLoggedIn = (req, res, next) => {
  if (req.user) {
    return next();
  } else {
    req.flash("error", "Please login before proceeding!");
    res.redirect("/user/login");
  }
};

module.exports.isNotLoggedIn = (req, res, next) => {
  if (req.user) {
    req.flash("error", "You are already Logged In!");
    res.redirect("/blogs");
  } else {
    next();
  }
};
