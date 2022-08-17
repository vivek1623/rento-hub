/* eslint-disable node/no-unsupported-features/es-syntax */
const Reservation = require("../models/reservationModel")
const User = require("../models/userModel")

const factory = require("../controllers/handlerFactory")
const catchAsync = require("../utils/catchAsync")
const ApiFeatures = require("../utils/apiFeatures")
const AppError = require("../utils/appError")

exports.getUserReservations = catchAsync(async (req, res, next) => {
  if (!req.body.userId) return next(new AppError("UserId is required", 400))

  const user = await User.findById(req.body.userId).select("name email")
  if (!user)
    return new AppError(`User ID: ${req.body.userId} is not found`, 404)

  req.query.user = user._id
  console.log(req.query)
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
        reservations
      },
    },
  })
})

exports.getAllReservations = factory.getAll(Reservation, "reservations")
exports.createReservation = factory.createOne(Reservation, "reservation")
exports.deleteReservation = factory.deleteOne(Reservation, "reservation")
