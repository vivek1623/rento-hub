/* eslint-disable node/no-unsupported-features/es-syntax */
const Vehicle = require("../models/vehicleModel")

const AppError = require("../utils/appError")
const ApiFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")
const factory = require("../controllers/handlerFactory")
const filterObjectData = require("../utils/filterObjectData")

exports.filterDataFromBody = (req, res, next) => {
  req.body = filterObjectData(req.body, "model", "color", "location", "description")
  next()
}

exports.getAllVehicles = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Vehicle.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const vehicles = await features.query
  if (!vehicles) return next(new AppError("Something went wrong", 500))

  res.status(200).json({
    status: "success",
    data: {
      vehicles,
    },
  })
})

exports.createVehicle = factory.createOne(Vehicle, "vehicle")
exports.getVehicle = factory.getOne(Vehicle, "vehicle")
exports.updateVehicle = factory.updateOne(Vehicle, "vehicle")
exports.deleteVehicle = factory.deleteOne(Vehicle, "vehicle")
