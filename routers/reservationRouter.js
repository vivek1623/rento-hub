const express = require("express")

const authController = require("../controllers/authController")
const reservationController = require("../controllers/reservationController")

const router = express.Router()

//All of below route should be protected
router.use(authController.protect)

router
  .route("/")
  .post(
    authController.permitted(["user"]),
    authController.setLoginUserIdInBody,
    reservationController.createReservation
  )

router
  .route("/myReservations")
  .get(
    authController.permitted(["user"]),
    authController.setLoginUserIdInQuery,
    reservationController.getAllReservations
  )

router.route("/:id").delete(reservationController.deleteReservation)

//All of below route should be accessable by ADMIN only
router.use(authController.permitted(["manager"]))
router.route("/vehicleReservations").get(reservationController.getVehicleReservations)
router.route("/userReservations").get(reservationController.getUserReservations)
router.route("/").get(reservationController.getAllReservations)

module.exports = router
