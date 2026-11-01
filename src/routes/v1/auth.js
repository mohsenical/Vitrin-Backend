const express = require("express")
const { send, verify, getMe } = require("../../controllers/v1/auth")
const { auth } = require("../../middlewares/auth")

//* Start coding ...
const router = express.Router()

router.route("/send").post(send)
router.route("/verify").post(verify)
router.route("/me").get(auth, getMe)

module.exports = router