const express = require("express")

const authController = require("../controllers/authController")
const vehicleController = require("../controllers/vehicleController")

const router = express.Router()

//All of below route should be protected
router.use(authController.protect)

router.route("/availableVehicles").get(vehicleController.getAvailableVehicles)
router.route("/").get(vehicleController.getAllVehicles)

//All of below route should be accessable by MANAGER only
router.use(authController.permitted(["manager"]))

router.route("/").post(vehicleController.createVehicle)
router
  .route("/:id")
  .get(vehicleController.getVehicle)
  .patch(vehicleController.filterDataFromBody, vehicleController.updateVehicle)
  .delete(vehicleController.deleteVehicle)

module.exports = router
