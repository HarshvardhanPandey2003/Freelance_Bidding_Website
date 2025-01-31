// 2.) backend/src/middleware/auth.middleware.js
// Checks for a JWT token in cookies.
// Verifies the token using jwt.verify().
// Fetches the user from the database and attaches it to req.user.
// Blocks unauthorized access with errors (e.g., throw new ApiError).
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.jwt;
  
  if (!token) {
    throw new ApiError(401, 'Not authorized - No token');
  }

  try {
    //The jwt.verify() function verifies the token using the JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    //The decoded object contains the payload of the JWT, which includes the user’s id
    //and while finding the user through id we exclude password for security puposes 
    if (!user) {
      throw new ApiError(401, 'User not found');
    }  
    req.user = user;
    // Attach the user details to the request
    next();
  }  catch (err) {
    res.status(401).json({ error: 'Not authorized - Invalid token' });
  }
});