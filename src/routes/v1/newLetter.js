const express = require("express")

const { getAll, create, answer } = require("../../controllers/v1/newLetter")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

//* Start coding ...
const router = express.Router()

router.route("/")
    .get(auth, roleGuard(["ADMIN", "OWNER"]), getAll)
    .post(create)

router.route("/answer")
    .post(auth, roleGuard(["OWNER", "ADMIN"]), answer)

module.exports = router