const { isValidObjectId } = require("mongoose");
const yup = require("yup")

const createStoryValidator = yup.object({
    productId: yup
            .string()
            .required("Product ID is required")
            .test(
                "is-valid-objectid",
                "Product ID must be a valid ObjectId",
                (value) => {
                    if (value === undefined) return;

                    return isValidObjectId(value)
                }
            ),
    title: yup.string().required("Title is required").min(3).max(32),
    description: yup.string().required("Description is required").min(3).max(1024),
    link: yup.string().required("Link is required").min(3).max(150),
})

module.exports = {
    createStoryValidator
}