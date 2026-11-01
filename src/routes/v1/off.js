const express = require("express")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")
const { getAll, create, setOnAll, getOne, remove, edit } = require("../../controllers/v1/off")

//* Start coding ...
const router = express.Router()

router.route("/")
    .get(auth, roleGuard(["OWNER", "ADMIN"]), getAll)
    .post(auth, roleGuard(["OWNER", "ADMIN"]), create);

router.route("/all")
    .post(auth, roleGuard(["OWNER", "ADMIN"]), setOnAll);

router.route("/:code").get(auth, getOne)

router.route("/:id")
    .delete(auth, roleGuard(["OWNER", "ADMIN"]), remove)
    .put(auth, roleGuard(["OWNER", "ADMIN"]), edit)

module.exports = router