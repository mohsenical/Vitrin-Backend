const express = require("express")

const {
    create,
    getAll,
    editNotification,
    deletedNotification,
    getOne,
    seen,
} = require("../../controllers/v1/notification")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

//* Start coding ...
const router = express.Router()

router.route("/")
    .post(auth, roleGuard(["OWNER", "ADMIN", "SELLER"]), create)
    .get(auth, roleGuard(["OWNER"]), getAll)

router.route("/:id")
    .put(auth, roleGuard(["OWNER", "ADMIN", "SELLER"]), editNotification)
    .delete(auth, roleGuard(["OWNER", "ADMIN", "SELLER"]), deletedNotification)

router.route("/get")
    .get(auth, getOne)

router.route("/see/:id")
    .put(auth, roleGuard(["OWNER", "ADMIN", "SELLER"]), seen)


module.exports = router