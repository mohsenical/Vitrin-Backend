const express = require("express")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

const { createCheckout, verifyCheckout } = require("../../controllers/v1/checkout")

//* Start coding ...
const router = express.Router()

router.route("/").post(auth, createCheckout)
router.route("/verify").get(verifyCheckout)

module.exports = router