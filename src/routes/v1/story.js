const express = require("express")
const { auth } = require("../../middlewares/auth")

const {
    getStories,
    crateStory,
    getOneStory,
    updateStory,
    deleteStory,
    getMyStories,
    viewStory,
} = require("../../controllers/v1/story")
const { multerStorage } = require("../../middlewares/upload")
const roleGuard = require("../../middlewares/roleGuard")

const upload = multerStorage("public/stories/", true)

//* Start coding ...
const router = express.Router()

router.route("/")
    .get(getStories)
    .post(auth, roleGuard(["OWNER", "ADMIN", "SELLER"]), upload.single("media"), crateStory)

router.route("/:id")
    .get(getOneStory)
    .delete(auth, roleGuard(["OWNER", "ADMIN", "SELLER"]), deleteStory)

router.route("/user/me")
    .get(auth, getMyStories)

router.route("/:id/view")
    .get(auth, viewStory)

module.exports = router