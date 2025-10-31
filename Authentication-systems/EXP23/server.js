const express = require("express");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const authMiddleware = require("./middleware/authMiddleware");

dotenv.config();
const app = express();
app.use(express.json());

// Hardcoded sample user (for demo)
const user = {
  username: "admin",
  password: "12345",
};

// Public Route — Login and get token
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Simple validation
  if (username === user.username && password === user.password) {
    // Create JWT token
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ message: "Login successful", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Protected Route — Only accessible with valid token
app.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Welcome to the protected route!",
    user: req.user,
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("JWT Protected Routes API Running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
