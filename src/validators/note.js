const { isValidObjectId } = require("mongoose")
const yup = require("yup");

const createNoteValidator = yup.object({
    content: yup.string().required("Content is required").min(3).max(1024),

    productID: yup
        .string()
        .required("Product ID is required")
        .test(
            "is-valid-objectid",
            "Department ID must be a valid ObjectId",
            isValidObjectId
        ),
})

const editNoteValidator = yup.object({
    content: yup.string().required("Content is required").min(3).max(1024),
})

module.exports = {
    createNoteValidator,
    editNoteValidator
}