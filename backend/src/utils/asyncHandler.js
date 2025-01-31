// src/utils/asyncHandler.js
export default (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (err) {
    next(err);
  }
};
  // This code creates an async error-handling wrapper for Express route handlers. 
  // It ensures proper error catching in asynchronous operations without needing try/catch blocks everywhere.