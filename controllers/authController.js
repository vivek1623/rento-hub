/* eslint-disable node/no-unsupported-features/node-builtins */
/* eslint-disable node/no-unsupported-features/es-syntax */
const jwt = require("jsonwebtoken")
// const crypto = require("crypto")
// const util = require("util")

const User = require("../models/userModel")
// const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
// const sendEmail = require("../utils/sendEmail")

const signToken = id => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN
  })
  return token
}

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  }
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true
  res.cookie("jwt", token, cookieOptions)
  user.password = undefined
  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user
    }
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  console.log(req)
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role
  })

  createAndSendToken(user, 200, res)
})
