const { isValidObjectId } = require("mongoose");
const yup = require("yup");

const createOffValidator = yup.object({
    code: yup.string().required("code is required").min(3).max(25),
    percent: yup.number().required("percent is required"),
    productId: yup
        .string()
        .required("Product ID is required")
        .test(
            "is-valid-objectid",
            "Department ID must be a valid ObjectId",
            isValidObjectId
        ),
    max: yup.number().required("percent is required").min(1).max(5),
});

const setOnOffValidator = yup.object({
    discount: yup.number().required("Discount is required"),
})

const editOffsValidator = yup.object({
    code: yup.string().min(3).max(25),
    percent: yup.number(),
    productId: yup
        .string()
        .test(
            "is-valid-objectid",
            "Department ID must be a valid ObjectId",
            (value) => {
                if (value === undefined) return true

                return isValidObjectId(value)
            }
        ),
})


module.exports = {
    createOffValidator,
    setOnOffValidator,
    editOffsValidator
}