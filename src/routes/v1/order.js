const express = require("express")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

const { getAllOrders, updateOrder } = require("../../controllers/v1/order")

//* Start coding ...
const router = express.Router()

router.route("/").get(auth, getAllOrders)
router.route("/:id").patch(auth, updateOrder)

module.exports = router