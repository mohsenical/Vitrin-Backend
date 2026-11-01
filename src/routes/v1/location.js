const express = require("express");
const { getAllCities } = require("../../controllers/v1/location")

//* Start coding ...
const router = express.Router();

router.route("/")
    .get(getAllCities)

module.exports = router;