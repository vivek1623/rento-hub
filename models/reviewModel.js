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
      required: [true, "rating must be avaliable"],
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

reviewSchema.pre(/^find/, function(next) {
  this.populate({
    path: "user",
    select: "name",
  })
  this.populate({
    path: "vehicle",
    select: "model",
  })
  next()
})

reviewSchema.statics.calcAverageRatings = async function(vehicleId) {
  const stats = await this.aggregate([
    {
      $match: { vehicle: vehicleId },
    },
    {
      $group: {
        _id: "$vehicle",
        ratingCount: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ])
  console.log("stats", stats)
  if (stats.length > 0)
    await Vehicle.findByIdAndUpdate(vehicleId, {
      ratingsQuantity: stats[0].ratingCount,
      ratingsAverage: stats[0].avgRating,
    })
  else
    await Vehicle.findByIdAndUpdate(vehicleId, {
      ratingsQuantity: 0,
      ratingsAverage: 3.5,
    })
}

reviewSchema.post("save", function(review, next) {
  this.constructor.calcAverageRatings(review.vehicle)
  next()
})

const Review = model("Review", reviewSchema)

module.exports = Review
