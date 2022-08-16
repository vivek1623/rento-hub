/* eslint-disable node/no-unsupported-features/es-syntax */
const User = require("../models/userModel")
const AppError = require("../utils/appError")
const ApiFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")
const factory = require("../controllers/handlerFactory")

const filterObj = (obj, ...allowedFields) => {
  const filteredObj = {}
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) filteredObj[el] = obj[el]
  })
  return filteredObj
}

exports.filterConfidentialDataFromBody = (req, res, next) => {
  if (req.body.password)
    return next(new AppError("password updation is not allowed", 401))
  req.body = filterObj(req.body, "email", "name", "role", "active")
  next()
}

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
    },
  })
})

exports.getUser = factory.getOne(User, "user")
exports.updateUser = factory.updateOne(User, "user")
exports.deleteUser = factory.deleteOne(User, "user")
