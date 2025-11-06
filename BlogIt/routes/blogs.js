const express = require("express");
const router = express.Router();
const Blog = require("../models/blog.js");
const { isLoggedIn } = require("../middlewares.js");
const { blogSchemaValidator } = require("../models.js");
const User = require("../models/user.js");

router.get("/blogs", async (req, res) => {
  try {
    const allBlogs = await Blog.find({}).populate("owner");
    res.render("index.ejs", { allBlogs });
  } catch (error) {
    req.flash("error", "Error loading blogs!");
    res.render("index.ejs", { allBlogs: [] });
  }
});

router.get("/blogs/new", isLoggedIn, (req, res) => {
  res.render("add.ejs");
});

router.get("/blogs/:id", async (req, res) => {
  const id = req.params.id;
  if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
    try {
      const blog = await Blog.findById(id)
        .populate("owner")
        .populate("comments.author");
      if (blog) {
        res.render("show.ejs", { blog });
      } else {
        req.flash("error", "No such blog exists!");
        res.redirect("/blogs");
      }
    } catch (error) {
      req.flash("error", "Invalid blog ID!");
      res.redirect("/blogs");
    }
  } else {
    req.flash("error", "Invalid blog ID!");
    res.redirect("/blogs");
  }
});

router.get("/blogs/:id/edit", isLoggedIn, async (req, res) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("error", "Invalid blog ID!");
    return res.redirect("/blogs");
  }
  try {
    const blog = await Blog.findById(id);
    if (blog) {
      const userId = res.locals.currentUser.id;
      const postOwnerId = blog.owner ? blog.owner.toString() : null;
      if (userId === postOwnerId) {
        res.render("edit.ejs", { blog });
      } else {
        req.flash("error", "You don't own this blog!");
        res.redirect(`/blogs/${id}`);
      }
    } else {
      req.flash("error", "No such blog exists!");
      res.redirect("/blogs");
    }
  } catch (error) {
    req.flash("error", "Error loading blog!");
    res.redirect("/blogs");
  }
});

router.put("/blogs/:id", isLoggedIn, blogSchemaValidator, async (req, res) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("error", "Invalid blog ID!");
    return res.redirect("/blogs");
  }
  try {
    const { title, content } = req.body.blog;
    const blog = await Blog.findById(id);
    if (blog) {
      const userId = res.locals.currentUser.id;
      const postOwnerId = blog.owner ? blog.owner.toString() : null;
      if (userId === postOwnerId) {
        await Blog.findByIdAndUpdate(
          id,
          { title, content },
          { runValidators: true }
        );
        req.flash("success", "Successfully updated the blog!");
        res.redirect(`/blogs/${id}`);
      } else {
        req.flash("error", "You don't own this blog!");
        res.redirect(`/blogs/${id}`);
      }
    } else {
      req.flash("error", "No such blog exists!");
      res.redirect("/blogs");
    }
  } catch (error) {
    req.flash("error", "Error updating blog!");
    res.redirect("/blogs");
  }
});

router.post("/blogs", isLoggedIn, blogSchemaValidator, async (req, res) => {
  const blog = req.body.blog;
  const userId = res.locals.currentUser.id;
  if (blog) {
    const newBlog = new Blog({
      title: blog.title,
      content: blog.content,
      owner: userId,
    });
    await newBlog.save();
    const id = newBlog.id;
    const currentUser = await User.findById(userId);
    currentUser.blogs.push(id);
    await currentUser.save();
    req.flash("success", "New blog posted successfully!");
    res.redirect(`/blogs/${id}`);
  } else {
    req.flash("error", "Please fill in all fields!");
    res.redirect("/blogs");
  }
});

router.delete("/blogs/:id", isLoggedIn, async (req, res) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("error", "Invalid blog ID!");
    return res.redirect("/blogs");
  }
  try {
    const userId = res.locals.currentUser.id;
    const blog = await Blog.findById(id);
    if (blog) {
      const postOwnerId = blog.owner ? blog.owner.toString() : null;
      if (postOwnerId === userId) {
        await Blog.findByIdAndDelete(id);
        const currentUser = await User.findById(userId);
        currentUser.blogs = currentUser.blogs.filter((blog) => {
          return blog.id !== blog.id;
        });
        await currentUser.save();
        req.flash("success", "Successfully deleted blog!");
        res.redirect("/blogs");
      } else {
        req.flash("error", "You don't own the blog!");
        res.redirect(`/blogs/${id}`);
      }
    } else {
      req.flash("error", "No such blog exist!");
      res.redirect("/blogs");
    }
  } catch (error) {
    req.flash("error", "Error deleting blog!");
    res.redirect("/blogs");
  }
});

//comments
router.post("/blogs/:id/comments", isLoggedIn, async (req, res) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    req.flash("error", "Invalid blog ID!");
    return res.redirect("/blogs");
  }
  try {
    const blog = await Blog.findById(id);
    if (blog) {
      const comment = {
        text: req.body.comment,
        author: req.user._id,
      };
      blog.comments.push(comment);
      await blog.save();
      req.flash("success", "Comment added successfully!");
      res.redirect(`/blogs/${id}`);
    } else {
      req.flash("error", "Blog not found!");
      res.redirect("/blogs");
    }
  } catch (error) {
    req.flash("error", "Error adding comment!");
    res.redirect(`/blogs/${id}`);
  }
});

router.delete(
  "/blogs/:id/comments/:commentId",
  isLoggedIn,
  async (req, res) => {
    const { id, commentId } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid blog ID!");
      return res.redirect("/blogs");
    }
    try {
      const blog = await Blog.findById(id);
      if (blog) {
        const comment = blog.comments.id(commentId);
        if (comment) {
          const userId = req.user._id.toString();
          const commentAuthorId = comment.author.toString();
          const blogOwnerId = blog.owner ? blog.owner.toString() : null;

          // Allow deletion if user is comment author or blog owner
          if (userId === commentAuthorId || userId === blogOwnerId) {
            comment.deleteOne();
            await blog.save();
            req.flash("success", "Comment deleted successfully!");
          } else {
            req.flash(
              "error",
              "You don't have permission to delete this comment!"
            );
          }
        } else {
          req.flash("error", "Comment not found!");
        }
        res.redirect(`/blogs/${id}`);
      } else {
        req.flash("error", "Blog not found!");
        res.redirect("/blogs");
      }
    } catch (error) {
      req.flash("error", "Error deleting comment!");
      res.redirect(`/blogs/${id}`);
    }
  }
);

module.exports = router;
