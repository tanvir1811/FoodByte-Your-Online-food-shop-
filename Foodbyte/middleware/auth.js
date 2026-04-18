function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ status: 'fail', message: 'Not logged in.' });
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    // Admin always passes any role-guarded route
    if (req.isAdmin()) return next();

    if (!req.session || !req.session.user) {
      return res.status(401).json({ status: 'fail', message: 'Not logged in.' });
    }
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ status: 'fail', message: 'Access denied.' });
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  if (!req.isAdmin()) {
    return res.status(403).json({ status: 'fail', message: 'Admin access only.' });
  }
  next();
}

module.exports = { requireLogin, requireRole, requireAdmin };