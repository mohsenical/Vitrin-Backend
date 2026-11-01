const yup = require("yup")

const createContactValidator = yup.object({
    title: yup.string().required("Title is required").min(3).max(32),
    firstName: yup.string().required("FirstName is required").min(3).max(32),
    lastName: yup.string().required("LastName is required").min(3).max(32),
    body: yup.string().required("Body is required").min(3).max(1024),
    email: yup.string().required("Email is required").matches(/^[^@\s]+@gmail\.com$/, "only gmail addresses are allowed !!").max(64),
})

const answerContactValidator = yup.object({
    email: yup.string().email().required("Email is required").min(3).max(64),
    answer: yup.string().required("Answer is required").min(3).max(1024),
})

module.exports = {
    createContactValidator,
    answerContactValidator
}