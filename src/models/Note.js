const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    content: {
        type: String,
        trim: true,
        required: true
    },
}, { timestamps: true })

const model = mongoose.models.Note || mongoose.model("Note", schema);
module.exports = model;