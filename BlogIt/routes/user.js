const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const Blog = require("../models/blog.js");
const { isNotLoggedIn, isLoggedIn } = require("../middlewares.js");
const { userSchemaValidator } = require("../models.js");

router.get("/login", isNotLoggedIn, (req, res) => {
  res.render("users/login.ejs");
});

router.get("/signup", isNotLoggedIn, (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/login",
  isNotLoggedIn,
  passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: "Invalid username or password!",
    successRedirect: "/blogs",
    successFlash: "Welcome back!",
  })
);

router.post("/signup", isNotLoggedIn, userSchemaValidator, async (req, res) => {
  try {
    const newUser = req.body.user;
    const user = await User.register(
      new User({ username: newUser.username, email: newUser.email }),
      newUser.password
    );
    req.login(user, (error) => {
      if (error) {
        req.flash(
          "error",
          "Unable to authenticate automatically! Please login manually!"
        );
        return res.redirect("/user/login");
      }
      req.flash("success", "Welcome! Account created successfully!");
      res.redirect("/blogs");
    });
  } catch (error) {
    req.flash("error", error.message || "Error creating account!");
    res.redirect("/user/signup");
  }
});

router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    const userId = res.locals.currentUser.id;
    const userBlogs = await Blog.find({ owner: userId }).sort({ createdAt: -1 });
    res.render("users/profile.ejs", { userBlogs });
  } catch (error) {
    req.flash("error", "Error loading profile!");
    res.redirect("/blogs");
  }
});

router.post("/logout", isLoggedIn, (req, res) => {
  req.logout((error) => {
    if (error) {
      return res.redirect("/blogs");
    }
    req.flash("success", "Successfully logged out!");
    res.redirect("/blogs");
  });
});

module.exports = router;
