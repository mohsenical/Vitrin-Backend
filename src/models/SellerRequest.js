const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },

    adminComment: {
        type: String,
        trim: true
    }
}, { timestamps: true })

const model = mongoose.models.SellerRequest || mongoose.model("SellerRequest", schema);
module.exports = model