// middlewares/auth.js
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    req.user = { id: req.session.userId }; // attach user info to request
    return next();
  }
  return res.status(401).json({ message: "Not authenticated" });
}

module.exports = { isAuthenticated };
