const express = require("express")

const {
    banUser,
    changeRole,
    createAddress,
    removeAddress,
    updateAddress,
    getAll,
    createProfile,
    removeProdile,
    updateProdile,
} = require("../../controllers/v1/user")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

//* Start coding ...
const router = express.Router()

router.route("/")
    .get(auth, roleGuard(["ADMIN", "OWNER"]), getAll)

router.route("/role/:userId")
    .put(auth, roleGuard(["OWNER"]), changeRole)

router.route("/ban/:userId")
    .post(auth, roleGuard(["ADMIN", "OWNER"]), banUser);

router.route("/me/addresses")
    .post(auth, createAddress)

router.route("/me/addresses/:addressId")
    .delete(auth, removeAddress)
    .patch(auth, updateAddress)

router.route("/me/profile")
    .post(auth, createProfile)
    .put(auth, updateProdile)

module.exports = router