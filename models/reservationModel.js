/* eslint-disable node/no-unsupported-features/es-syntax */
const { Schema, model } = require("mongoose")

const reservationSchema = new Schema(
  {
    vehicle: {
      type: Schema.ObjectId,
      ref: "Vehicle",
      required: [true, "Review must belong to a vehicle"],
    },
    user: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to an user"],
    },
    startDate: {
      type: Date,
      required: [true, "Reservation start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Reservation start date is required"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

reservationSchema.pre(/^find/, function(next) {
  this.populate({
    path: "user",
    select: "name",
  }).populate({
    path: "vehicle",
    select: "model color location",
  })
  next()
})

const Reservation = model("Reservation", reservationSchema)

module.exports = Reservation
