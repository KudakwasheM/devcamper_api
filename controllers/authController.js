const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

//Desc      Register User
//Route     POST /api/v1/auth/register
//Access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //   Create User
  const user = await User.create({ name, email, password, role });

  //   Create token
  if (user) {
    generateToken(res, user._id);
    res.status(200).json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// Desc   Login User
// Route  POST /api/v1/auth/login
// Access Public
exports.login = asyncHandler(async (req, res, next) => {
  console.log("Login");
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse("Please provide both email and password", 400)
    );
  }

  // Check user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  // Check if password matches
  const isPasswordMatch = await user.matchPassword(password);

  if (!isPasswordMatch) {
    return next(new ErrorResponse("Invalid email or password", 401));
  }

  generateToken(res, user._id);

  res.status(200).json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

// Desc   Get current logged in User
// Route  POST /api/v1/auth/me
// Access Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("-password");

  res.status(200).json({
    success: true,
    data: user,
  });
});
