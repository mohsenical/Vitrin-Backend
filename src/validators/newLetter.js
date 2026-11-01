const yup = require("yup")

const createNewLetterValidator = yup.object({
    email: yup.string().required("Email is required").matches(/^[^@\s]+@gmail\.com$/, "only gmail addresses are allowed !!").max(64),
})

const answerNewLetterValidator = yup.object({
    subject: yup.string().required("Subject is required").min(3).max(120),
    answer: yup.string().required("Answer is required").min(3).max(500),
})

module.exports = {
    createNewLetterValidator,
    answerNewLetterValidator
}