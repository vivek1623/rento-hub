/* eslint-disable node/no-unsupported-features/es-syntax */
const Reservation = require("../models/reservationModel")

const factory = require("../controllers/handlerFactory")
const catchAsync = require("../utils/catchAsync")


exports.getAllReservations = factory.getAll(Reservation, "reservation")
exports.createReservation = factory.createOne(Reservation, "reservations")
exports.deleteReservation = factory.deleteOne(Reservation, "reservation")
