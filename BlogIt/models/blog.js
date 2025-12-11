const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 500,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

const Blog = mongoose.model("blog", blogSchema);

module.exports = Blog;
