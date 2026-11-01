const express = require("express")

const { search } = require("../../controllers/v1/search")

const router = express.Router()

router.route("/").get(search)

module.exports = router