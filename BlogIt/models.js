const joi = require("joi");

const blogSchema = joi.object({
  blog: joi
    .object({
      title: joi.string().min(3).required(),
      content: joi.string().min(10).required(),
    })
    .unknown(false),
});

module.exports.blogSchemaValidator = (req, res, next) => {
  const { error } = blogSchema.validate(req.body);
  if (error) {
    req.flash("error", "Please fill in all fields properly!");
    res.redirect("/blogs");
  } else {
    next();
  }
};

const userSchema = joi.object({
  user: joi
    .object({
      username: joi.string().min(3).required(),
      password: joi.string().min(6).required(),
      email: joi.string().email().optional(),
    })
    .unknown(false),
});

module.exports.userSchemaValidator = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    req.flash("error", "Please fill in all fields properly!");
    res.redirect("/user/signup");
  } else {
    next();
  }
};
