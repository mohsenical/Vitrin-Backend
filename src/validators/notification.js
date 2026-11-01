const { isValidObjectId } = require("mongoose")
const yup = require("yup")

const createNotificationValidator = yup.object({
    userId: yup
        .string()
        .required("User ID is required")
        .test(
            "is-valid-objectid",
            "User ID must be a valid ObjectId",
            isValidObjectId
        ),
    message: yup.string().required("Message is required").min(3).max(500),
})

const editNotificationValidator = yup.object({
    userId: yup
        .string()
        .required("User ID is required")
        .test(
            "is-valid-objectid",
            "User ID must be a valid ObjectId",
            (value) => {
                if (value === undefined) return true

                return isValidObjectId(value)
            }
        ),
    message: yup.string().required("Message is required").min(3).max(500),
})

module.exports = {
    createNotificationValidator,
    editNotificationValidator
}