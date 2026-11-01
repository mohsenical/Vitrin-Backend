const express = require("express")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

const { getAllSellerRequests, createSellerRequest, deleteSellerRequest, updateSellerRequest } = require("../../controllers/v1/sellerRequest")

//* Start coding ...
const router = express.Router()

router.route("/")
    .get(auth, roleGuard(["SELLER", "OWNER"]), getAllSellerRequests)
    .post(auth, roleGuard(["SELLER", "OWNER"]), createSellerRequest)

router.route("/:id")
    .delete(auth, roleGuard(["SELLER", "OWNER"]), deleteSellerRequest)
    .patch(auth, roleGuard(["ADMIN", "OWNER"]), updateSellerRequest)

module.exports = router