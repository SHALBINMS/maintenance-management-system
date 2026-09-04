const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role?.trim().toLowerCase();
    const role = requiredRole?.trim().toLowerCase();

    if (!userRole || userRole !== role) {
      return res.status(403).json({
        error: "Access denied. You do not have the required role.",
      });
    }

    next();
  };
};

module.exports = authorizeRole;
