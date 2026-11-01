const yup = require("yup");

const createDepartmentValidator = yup.object({
    title: yup.string().required("Title is required").min(3).max(75),
});

const editDepartmentValidator = yup.object({
    title: yup.string().required("Title is required").min(3).max(75),
});

module.exports = {
    createDepartmentValidator,
    editDepartmentValidator
}