const { isValidObjectId } = require("mongoose");
const yup = require("yup");

const createTicketValidator = yup.object({
    departmentId: yup
        .string()
        .required("Department ID is required")
        .test(
            "is-valid-objectid",
            "Department ID must be a valid ObjectId",
            isValidObjectId
        ),

    departmentSubId: yup
        .string()
        .required("Sub Department ID is required")
        .test(
            "is-valid-objectid",
            "Sub Department ID must be a valid ObjectId",
            isValidObjectId
        ),

    title: yup.string().required("Title is required").min(3).max(50),

    body: yup.string().required("body is required").min(3).max(1024),

    orderId: yup
        .string()
        .test(
            "is-valid-objectid",
            "Order ID must be a valid ObjectId",
            (value) => {
                if (value === undefined) return true;

                return isValidObjectId(value)
            }
        ),

    sellerId: yup
        .string()
        .test(
            "is-valid-objectid",
            "Seller ID must be a valid ObjectId",
            (value) => {
                if (value === undefined) return true;

                return isValidObjectId(value)
            }
        ),

    productId: yup
        .string()
        .test(
            "is-valid-objectid",
            "Product ID must be a valid ObjectId",
            (value) => {
                if (value === undefined) return true;

                return isValidObjectId(value)
            }
        ),
});

const answerTicketValidator = yup.object({
    body: yup.string().required("body is required").min(3).max(1024),
});

const editTicketValidator = yup.object({
    departmentId: yup
    .string()
    .test(
        "is-valid-objectid",
        "Department ID must be a valid ObjectId",
        (value) => {
                if (value === undefined) return true;

                return isValidObjectId(value)
            }
        ),

    departmentSubId: yup
        .string()
        .test(
            "is-valid-objectid",
            "Sub Department ID must be a valid ObjectId",
            (value) => {
                if (value === undefined) return true;

                return isValidObjectId(value)
            }
        ),

    title: yup.string().min(3).max(50),

    body: yup.string().min(3).max(1024),
});



module.exports = {
    createTicketValidator,
    answerTicketValidator,
    editTicketValidator
}