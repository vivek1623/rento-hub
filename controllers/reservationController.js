/* eslint-disable node/no-unsupported-features/es-syntax */
const Reservation = require("../models/reservationModel")

const factory = require("../controllers/handlerFactory")

exports.getAllReservations = factory.getAll(Reservation, "reservations")
exports.createReservation = factory.createOne(Reservation, "reservation")
exports.deleteReservation = factory.deleteOne(Reservation, "reservation")
