const mongoose = require("mongoose")

const schema = new mongoose.Schema({

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    message: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    seen: {
        type: Number,
        enum: [0, 1],
        default: 0
    },
}, { timestamps: true })

const model = mongoose.models.Notification || mongoose.model("Notification", schema)
module.exports = model
