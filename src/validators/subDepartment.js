const { isValidObjectId } = require("mongoose");
const yup = require("yup");

const createSubDepartmentValidator = yup.object({
    title: yup.string().required("Title is required").min(3).max(75),
    parent: yup
        .string()
        .required("Parent ID is required")
        .test(
            "is-valid-objectid",
            "Parent ID must be a valid ObjectId",
            isValidObjectId
        ),
});

const editSubDepartmentValidator = yup.object({
    title: yup.string().required("Title is required").min(3).max(75),
    parent: yup
        .string()
        .required("Parent ID is required")
        .test(
            "is-valid-objectid",
            "Parent ID must be a valid ObjectId",
            isValidObjectId
        ),
});

module.exports = {
    createSubDepartmentValidator,
    editSubDepartmentValidator
}   