/**
 * Require specific user roles (for patient/super_admin routes).
 * @param  {...string} roles - Allowed roles
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions.' });
    }
    next();
  };
};

/**
 * Ensure hospital admin can only access their own hospital's resources.
 * Checks req.admin.hospitalId against :hospitalId param or req.body.hospitalId.
 */
export const requireHospital = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, error: 'Admin authentication required.' });
  }

  const resourceHospitalId = req.params.hospitalId || req.body.hospitalId;

  // If route doesn't specify a hospitalId, the controller uses req.admin.hospitalId directly
  if (resourceHospitalId && resourceHospitalId !== req.admin.hospitalId) {
    return res.status(403).json({ success: false, error: 'You can only manage your own hospital.' });
  }

  next();
};
