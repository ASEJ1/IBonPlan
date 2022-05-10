const express = require("express")
const router = express.Router()
const userController = require("../controllers/user-controller")
const {verifyEmail} = require ('../config/JWT')


router.route("/").get(userController.getAll)
router.route("/all").delete(userController.deleteAll);

router.post("/register", userController.register);
router.post("/login",verifyEmail, userController.login);
router.get("/verify-email",userController.verify);
router.post("/forgot-password", userController.forgotPassword);
router.put("/update-profile", userController.updateProfile);
router.get("/update-password", userController.updatePassword);

router.route("/one")
    .get(userController.get)
    .delete(userController.delete);



module.exports = router