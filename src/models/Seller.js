const mongoose = require("mongoose")

const schema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    contactDetails: {
        phone: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            trim: true
        }
    },

    cityId: {
        type: Number,
        required: true,
        trim: true
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true

    }
}, { timestamps: true })

const model = mongoose.models.Seller || mongoose.model("Seller", schema)
module.exports = model