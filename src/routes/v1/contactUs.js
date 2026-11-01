const express = require("express")

const { getAll, create, remove, answer } = require("../../controllers/v1/contactUs")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

const { multerStorage } = require("../../middlewares/upload")

//* Start coding ...
const router = express.Router()

const upload = multerStorage("public/contact-us/", true)

router.route("/")
    .get(auth, roleGuard(["OWNER", "ADMIN"]), getAll)
    .post(upload.single("file"), create)

router.route("/:id")
    .delete(auth, roleGuard(["OWNER", "ADMIN"]), remove)

router.route("/answer")
    .post(auth, roleGuard(["OWNER", "ADMIN"]), answer)

module.exports = router