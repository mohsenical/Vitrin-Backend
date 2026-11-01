const express = require("express")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")
const { getCart, addToCart, removeFromCart } = require("../../controllers/v1/cart")

//* Start coding ...
const router = express.Router()

router.route("/").get(auth, getCart)
router.route("/add").post(auth, addToCart)
router.route("/remove").delete(auth, removeFromCart)

module.exports = router