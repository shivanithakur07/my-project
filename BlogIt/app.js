const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const User = require("./models/user.js");
const ejsEngine = require("ejs-mate");
const methodOverride = require("method-override");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const connectFlash = require("connect-flash");
const localStrategy = require("passport-local");
const blogsRouter = require("./routes/blogs.js");
const userRouter = require("./routes/user.js");
require("dotenv").config({ quiet: true });

app.set("view engine", "ejs");
app.engine("ejs", ejsEngine);
app.set("views", path.join(__dirname, "/views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));
app.use(cookieParser());
app.set("trust proxy", 1);

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "keyboard cat",
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionOptions));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(connectFlash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
};

main()
  .then(() => {
    console.log("successfully connected to database!");
  })
  .catch((error) => {
    console.log("Error while connecting to database!");
  });

const port = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.redirect("/blogs");
});

app.use("/user", userRouter);
app.use("/", blogsRouter);

app.use((err, req, res, next) => {
  req.flash("error", "Server side error! Please try again!");
  res.redirect("/blogs");
});

app.listen(port, () => {
  console.log(`server successfully started server on ${port}!`);
});
