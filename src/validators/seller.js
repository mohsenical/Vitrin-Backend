const yup = require("yup")

const createSellerValidator = yup.object().shape({
    name: yup
        .string()
        .required("Name is required")
        .max(255, "Name cannot exceed characters"),

    contactDetails: yup.object().shape({
        phone: yup.string().required("Phone is required").trim(),
        email: yup.string().email().required("Email is required").trim(),
    }),

    cityId: yup.number().required("City is required").positive().integer()
})

const updateSellerValidator = yup.object().shape({
    name: yup
        .string()
        .max(255, "Name cannot exceed characters"),

    contactDetails: yup.object().shape({
        phone: yup.string().trim(),
        email: yup.string().email().trim(),
    }),

    cityId: yup.number().positive().integer()
})

module.exports = { createSellerValidator,  updateSellerValidator }