import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Check if user is logged in
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, please login' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();

  } catch (error) {
    res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// Check user role
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role '${req.user.role}' is not allowed to access this route`
      });
    }
    next();
  };
};