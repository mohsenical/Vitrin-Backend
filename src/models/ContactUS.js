const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

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

    email: {
        type: String,
        required: true,
        trim: true
    },

    body: {
        type: String,
        required: true,
        trim: true
    },

    file: {
        type: {
            fileName: { type: String, trim: true },
            path: { type: String, trim: true }
        },
    },

    typeMedia: {
        type: String,
        enum: ["video", "image"],
    },


    answer: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
}, { timestamps: true })

const model = mongoose.models.ContactUs || mongoose.model("ContactUs", schema)
module.exports = model;