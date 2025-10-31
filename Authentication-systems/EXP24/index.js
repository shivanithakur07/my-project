// index.js
require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_with_a_strong_secret';

// --- Demo users (in-memory). In production use a DB. ---
// Passwords will be hashed at startup from plainTextPassword for demo convenience.
const demoUsers = [
  { id: 1, username: 'alice', plainPassword: 'adminpass', role: 'Admin' },
  { id: 2, username: 'bob',   plainPassword: 'modpass',   role: 'Moderator' },
  { id: 3, username: 'carol', plainPassword: 'userpass',  role: 'User' },
];

// We'll store hashed password as "password" on each user after hashing
const users = [];

async function seedUsers() {
  for (const u of demoUsers) {
    const hashed = await bcrypt.hash(u.plainPassword, 10);
    users.push({ id: u.id, username: u.username, password: hashed, role: u.role });
  }
}

// --- Auth utilities ---
function signToken(user) {
  // include role in payload
  const payload = { id: user.id, username: user.username, role: user.role };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

// Middleware: verify JWT and attach user payload to req.user
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, username, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware factory: require one or more roles
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient role for this resource' });
    }
    next();
  };
}

// --- Routes ---

// Public health check
app.get('/', (req, res) => res.json({ status: 'RBAC server running' }));

// Login: returns JWT with role inside
app.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken(user);
  res.json({ token, expiresIn: '1h', role: user.role });
});

// Protected: any authenticated user can access profile
app.get('/profile', verifyToken, (req, res) => {
  // In a real app you'd fetch full info from DB using req.user.id
  res.json({ message: 'Your profile', user: { id: req.user.id, username: req.user.username, role: req.user.role } });
});

// Admin-only route
app.get('/admin/dashboard', verifyToken, requireRole('Admin'), (req, res) => {
  res.json({ message: 'Welcome to Admin dashboard', admin: req.user.username });
});

// Moderator-only route (Moderator and Admins might share access if desired)
app.get('/moderation', verifyToken, requireRole('Moderator', 'Admin'), (req, res) => {
  res.json({ message: 'Moderator panel - manage content', user: req.user.username });
});

// Example: route accessible to User role (and also Admins if desired)
app.get('/user/home', verifyToken, requireRole('User', 'Admin', 'Moderator'), (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is user content.` });
});

// Example: route demonstrating insufficient token or expired
app.get('/sensitive', verifyToken, requireRole('Admin'), (req, res) => {
  res.json({ secret: '42 — top secret for admins only' });
});

// Start server after seeding users
seedUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`RBAC server listening on http://localhost:${PORT}`);
    console.log('Demo users:');
    users.forEach(u => console.log(` - ${u.username} (${u.role})`));
    console.log('Use POST /login with JSON { "username": "...", "password": "..." } to obtain a token.');
  });
});
