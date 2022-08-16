/* eslint-disable node/no-unsupported-features/es-syntax */
const Review = require("../models/reviewModel")

const factory = require("../controllers/handlerFactory")

exports.setVehicleUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id
  next()
}

exports.getAllReviews = factory.getAll(Review, "reviews")

exports.createReview = factory.createOne(Review, "review")
