/* eslint-disable node/no-unsupported-features/es-syntax */
const User = require("../models/userModel")
const AppError = require("../utils/appError")
const ApiFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const users = await features.query.select("-passwordChangedAt")
  if (!users) return next(new AppError("Something went wrong", 500))

  res.status(200).json({
    status: "success",
    data: {
      users,
    }
  })
})
