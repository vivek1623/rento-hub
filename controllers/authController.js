/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require("jsonwebtoken")
// const crypto = require("crypto")
const util = require("util")

const User = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
// const sendEmail = require("../utils/sendEmail")

const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
  return token
}

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  }
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true
  res.cookie("jwt", token, cookieOptions)
  user.password = undefined
  user.passwordChangedAt = undefined
  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  })

  createAndSendToken(user, 200, res)
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400))
  }

  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password")
  if (!user || !(await user.isCorrectPassword(password, user.password)))
    return next(new AppError("Incorrect email or password", 401))

  // 3) If everything ok, send token to client
  createAndSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  )
    token = req.headers.authorization.split(" ")[1]

  if (!token)
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    )

  // 2) Verification token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  )

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id)
  if (!currentUser) {
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    )
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.isChangedPasswordAfterJWTCreation(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.", 401)
    )
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser
  next()
})

exports.permitted = roles => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You do not have permission to perform this action", 403)
      )
    next()
  }
}
