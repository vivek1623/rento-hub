const express = require("express")

const authController = require("../controllers/authController")
const userController = require("../controllers/userController")

const router = express.Router()

router.post("/signup", authController.signup)
router.post("/login", authController.login)

//All of below route should be protected
router.use(authController.protect)

//All of below route should be accessable by ADMIN only
router.use(authController.permitted(["manager"]))
router.route("/").get(userController.getAllUsers)
router
  .route("/:id")
  .get(userController.getUser)
  .patch(
    userController.filterConfidentialDataFromBody,
    userController.updateUser
  )
  .delete(userController.deleteUser)

module.exports = router
