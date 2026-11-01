const yup = require("yup")

const createProfileValidator = yup.object({
    username: yup.string().required("Username is required").min(3).max(32),
    firstName: yup.string().required("First name is required").min(3).max(32),
    lastName: yup.string().required("Last name is required").min(3).max(32),
    birthday: yup.string().required("Birthday is required").min(10).max(10),
    nationalCode: yup.string().required("National code is required").min(10).max(10),
    email: yup.string().matches(/^[^@\s]+@gmail\.com$/, "only gmail addresses are allowed !!")
})

const updatedProfileValidator = yup.object({
    username: yup.string().min(3).max(32),
    firstName: yup.string().min(3).max(32),
    lastName: yup.string().min(3).max(32),
    birthday: yup.string().min(10).max(10),
    nationalCode: yup.string().min(10).max(10),
    email: yup.string().matches(/^[^@\s]+@gmail\.com$/, "only gmail addresses are allowed !!")
})

module.exports = {
    createProfileValidator,
    updatedProfileValidator
}