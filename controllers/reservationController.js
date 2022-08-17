/* eslint-disable node/no-unsupported-features/es-syntax */
const Reservation = require("../models/reservationModel")
const User = require("../models/userModel")
const Vehicle = require("../models/vehicleModel")

const factory = require("../controllers/handlerFactory")
const catchAsync = require("../utils/catchAsync")
const ApiFeatures = require("../utils/apiFeatures")
const AppError = require("../utils/appError")

exports.getVehicleReservations = catchAsync(async (req, res, next) => {
  if (!req.query.vehicle)
    return next(new AppError("VehicleId is required", 400))

  const vehicle = await Vehicle.findById(req.query.vehicle).select(
    "model color location"
  )
  if (!vehicle)
    return new AppError(`Vehicle ID: ${req.query.vehicle} is not found`, 404)

  const features = new ApiFeatures(Reservation.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const reservations = await features.query.select("-vehicle")
  if (!reservations) return next(new AppError("Something went wrong", 500))

  res.status(201).json({
    status: "success",
    data: {
      vehicleDetails: {
        id: vehicle.id,
        model: vehicle.model,
        color: vehicle.color,
        location: vehicle.location,
        reservations,
      },
    },
  })
})

exports.getUserReservations = catchAsync(async (req, res, next) => {
  if (!req.query.user) return next(new AppError("UserId is required", 400))

  const user = await User.findById(req.query.user).select("name email")
  if (!user) return new AppError(`User ID: ${req.query.user} is not found`, 404)

  const features = new ApiFeatures(Reservation.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const reservations = await features.query.select("-user")
  if (!reservations) return next(new AppError("Something went wrong", 500))

  res.status(201).json({
    status: "success",
    data: {
      userDetails: {
        id: user._id,
        name: user.name,
        email: user.email,
        reservations,
      },
    },
  })
})

exports.getAllReservations = factory.getAll(Reservation, "reservations")
exports.createReservation = factory.createOne(Reservation, "reservation")
exports.deleteReservation = factory.deleteOne(Reservation, "reservation")
