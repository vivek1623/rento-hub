/* eslint-disable node/no-unsupported-features/es-syntax */
const { Schema, model } = require("mongoose")

const vehicleSchema = new Schema(
  {
    model: {
      type: String,
      trim: true,
      required: [true, "model must be available"],
    },
    description: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
      required: [true, "Color must be available"],
    },
    ratingsAverage: {
      type: Number,
      default: 4.0,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    location: {
      type: String,
      trim: true,
      required: [true, "Location must be available"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

//Virtual Populate
vehicleSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "vehicle",
  localField: "_id",
})

const Vehicle = model("Vehicle", vehicleSchema)

module.exports = Vehicle
