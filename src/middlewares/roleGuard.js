const { errorResponse } = require("../helpers/responses")

module.exports = (roles) => {
    return async (req, res, next) => {
        try {

            const hasAccessRole = roles?.some(role => {
                return req.user.roles.includes(role)
            })

            if (!hasAccessRole) {
                return errorResponse(res, 401, "You have not access to this route !!")
            }

            next()
        } catch (err) {
            next(err)
        }
    }
}