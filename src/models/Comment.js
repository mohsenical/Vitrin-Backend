const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    content: {
        type: String,
        required: true
    },

    isAccept: {
        type: Number,
        enum: [0, 1],
        default: 0
    },

}, { timestamps: true })

const schema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    isAccept: {
        type: Number,
        enum: [0, 1],
        default: 0
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },

    content: {
        type: String,
        required: true,
    },

    replies: {
        type: [replySchema]
    }
}, { timestamps: true })

const model = mongoose.models.Comment || mongoose.model("Comment", schema);
module.exports = model