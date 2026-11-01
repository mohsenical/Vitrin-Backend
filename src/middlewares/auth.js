const jwt = require("jsonwebtoken")

const { errorResponse } = require("../helpers/responses");
const userModel = require("./../models/User");
const banModel = require("./../models/Ban");
const { default: mongoose } = require("mongoose");


exports.auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization
        if (!token) {
            return errorResponse(res, 403, "Token not provided !!")
        }

        const tokenArray = token.split(" ")
        if (tokenArray[0] !== "Bearer") {
            return errorResponse(res, 401, "Write [ Bearer ] at the start of the token")
        }

        const tokenValue = tokenArray[1]

        const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET_ACCESS_TOKEN)
        if (!decoded) {
            return errorResponse(res, 401, "Token is not valid !!")
        }           

        const id = decoded.userId

        const user = await userModel.findOne({ _id: id })
        if (!user) {
            return errorResponse(res, 404, "User not found !!")
        }

        req.user = user
        

        next()
    } catch (err) {
        next(err)
    }
}