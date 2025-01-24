// 2.) backend/src/middleware/auth.middleware.js
//This code defines a middleware function called protect that is used to authenticate users
// by verifying a JSON Web Token (JWT) stored in a cookie.
// If token is valid then their inforis attached to the req object for use in subsequent middleware or route handlers.
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
    //and we exclude passwprd for security puposes 
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