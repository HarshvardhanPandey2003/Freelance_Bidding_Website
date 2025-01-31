// backend/src/middleware/role.middleware.js
export const requireRole = (role) => (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({
        error: `Forbidden - ${role} role required`
      });
    }
    next();
  };

// This middleware implements role-based access control (RBAC) to restrict route access to specific user roles.
// It checks if the authenticated user's role matches the required role passed to the middleware.