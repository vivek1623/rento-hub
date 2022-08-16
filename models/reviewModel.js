/* eslint-disable node/no-unsupported-features/es-syntax */
const { Schema, model } = require("mongoose")

const Vehicle = require("./vehicleModel")

const reviewSchema = new Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, "review must be avaliable"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
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

const Review = model("Review", reviewSchema)

module.exports = Review
