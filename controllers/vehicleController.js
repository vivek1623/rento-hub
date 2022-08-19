/* eslint-disable node/no-unsupported-features/es-syntax */
const Vehicle = require("../models/vehicleModel")
const Reservation = require("../models/reservationModel")

const AppError = require("../utils/appError")
const ApiFeatures = require("../utils/apiFeatures")
const catchAsync = require("../utils/catchAsync")
const factory = require("../controllers/handlerFactory")
const filterObjectData = require("../utils/filterObjectData")

exports.filterDataFromBody = (req, res, next) => {
  req.body = filterObjectData(
    req.body,
    "model",
    "color",
    "location",
    "description"
  )
  next()
}

exports.getVehicleReservationDates = catchAsync(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.query.vehicleId)
  if (!vehicle) return next(new AppError("Something went wrong", 500))

  const stats = await Reservation.aggregate([
    {
      $match: {
        vehicle: vehicle._id,
      },
    },
    {
      $group: {
        _id: "$vehicle",
        reservedDates: {
          $push: { startDate: "$startDate", endDate: "$endDate" },
        },
      },
    },
  ])

  let reservedDates = []
  if (stats.length > 0) reservedDates = stats[0].reservedDates

  res.status(200).json({
    status: "success",
    data: {
      vehicleId: vehicle.id,
      reservedDates,
    },
  })
})

exports.getAvailableVehicles = catchAsync(async (req, res, next) => {
  let reservedVehicles = []
  console.log(new Date(new Date(req.query.endDate).setHours(23, 59, 59)))
  if (req.query.startDate && req.query.endDate) {
    const start = new Date(new Date(req.query.startDate).setHours(00, 00, 00))
    const end = new Date(new Date(req.query.endDate).setHours(23, 59, 59))
    const stats = await Reservation.aggregate([
      {
        $match: {
          $or: [
            {
              startDate: {
                $gte: start,
              },
              endDate: {
                $lt: end,
              },
            },
            {
              startDate: {
                $lte: start,
              },
              endDate: {
                $gt: start,
              },
            },
            {
              startDate: {
                $lt: end,
              },
              endDate: {
                $gte: end,
              },
            },
            {
              startDate: {
                $lte: start,
              },
              endDate: {
                $gte: end,
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$vehicle",
        },
      },
    ])
    if (stats?.length > 0)
      stats.forEach((item) => {
        if (item?._id) reservedVehicles.push(item._id)
      })
  }

  const features = new ApiFeatures(
    Vehicle.find({ _id: { $nin: reservedVehicles } }),
    req.query
  )
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

// exports.getAllVehicles = catchAsync(async (req, res, next) => {
//   const features = new ApiFeatures(Vehicle.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate()

//   const vehicles = await features.query
//   if (!vehicles) return next(new AppError("Something went wrong", 500))

//   res.status(200).json({
//     status: "success",
//     data: {
//       vehicles,
//     },
//   })
// })

exports.getAllVehicles = factory.getAll(Vehicle, "vehicles")
exports.createVehicle = factory.createOne(Vehicle, "vehicle")
exports.getVehicle = factory.getOne(Vehicle, "vehicle", { path: "reviews" })
exports.updateVehicle = factory.updateOne(Vehicle, "vehicle")
exports.deleteVehicle = factory.deleteOne(Vehicle, "vehicle")
