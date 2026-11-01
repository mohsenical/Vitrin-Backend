const { successResponse } = require("../../helpers/responses")

const cities = require("../../cities/cities")
const provinces = require("../../cities/provinces")

exports.getAllCities = async (req, res, next) => {
    try {
        return successResponse(res, 200, {
            cities,
            provinces
        })
    } catch (err) {
        next(err)
    }
}