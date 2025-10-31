his project implements Role-Based Access Control (RBAC) in a Node.js backend using JWT authentication.
Users have roles: Admin, Moderator, and User, each with different route access.
Demo users:

alice → Admin

bob → Moderator

carol → User

Features:

JWT login with role in payload

Middleware to verify tokens and roles

Admin-only, Moderator-only, and User routes

Clear error messages for invalid or unauthorized access