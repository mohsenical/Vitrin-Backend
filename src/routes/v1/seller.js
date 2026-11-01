const express = require("express");

const { create, get, updateSeller, deleteSeller } = require("../../controllers/v1/seller");

const { auth } = require("../../middlewares/auth");
const roleGuard = require("../../middlewares/roleGuard");

//* Start coding ...
const router = express.Router();

router.route("/")
    .post(auth, roleGuard(["SELLER", "OWNER"]), create)
    .get(auth, roleGuard(["SELLER", "OWNER"]), get)

router.route("/update")
    .patch(auth, roleGuard(["SELLER", "OWNER"]), updateSeller)

router.route("/remove")
    .delete(auth, roleGuard(["SELLER", "OWNER"]), deleteSeller)


module.exports = router