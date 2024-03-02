const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");

      next();
    } catch (error) {
      return next(new ErrorResponse("Not authorized, invalid token", 401));
    }
  } else {
    return next(new ErrorResponse("Not authorized, no token", 401));
  }

  // Another way
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   token = req.headers.authorization.split(" ")[1];
  // }

  // // else if (req.cookies.token) {
  // //   token = req.cookies.token;
  // // }

  // if(!token){
  //   return next(new ErrorResponse('Not authorized to access this route',401))
  // }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
