const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },

    percent: {
        type: Number,
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    max: {
        type: Number,
        default: 1
    },
    
    uses: {
        type: Number,
        default: 0
    },
    
    createtor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
}, { timestamps: true })

const model = mongoose.models.Off || mongoose.model("Off", schema)
module.exports = model