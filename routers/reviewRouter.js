const express = require("express")

const authController = require("../controllers/authController")
const reviewController = require("../controllers/reviewController")

const router = express.Router()

//All of below route should be protected
router.use(authController.protect)

router
  .route("/")
  .post(
    authController.permitted(["user"]),
    reviewController.setVehicleUserId,
    reviewController.createReview
  )

//All of below route should be accessable by ADMIN only
router.use(authController.permitted(["manager"]))

router.route("/").get(reviewController.getAllReviews)

module.exports = router
