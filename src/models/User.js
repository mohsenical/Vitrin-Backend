const mongoose = require("mongoose")

const addressSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    cityId: {
        type: Number,
        required: true,
        trim: true
    }
})

const profileSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },

    lastName: {
        type: String,
        required: true,
        trim: true
    },

    birthday: {
        type: String,
        required: true,
        trim: true
    },

    nationalCode: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        trim: true
    },
})

const userSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true
    },

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    roles: {
        type: [String],
        enum: ["OWNER", "ADMIN", "SELLER", "USER"],
        default: ["USER"]
    },

    addresses: [addressSchema],

    profile: profileSchema,
}, { timestamps: true })

const model = mongoose.models.User || mongoose.model("User", userSchema)

module.exports = model