const mongoose = require("mongoose")


const schema = new mongoose.Schema({

    departmentId: {
        type: mongoose.Types.ObjectId,
        ref: "Department",
        required: true
    },

    departmentSubId: {
        type: mongoose.Types.ObjectId,
        ref: "SubDepartment",
        required: true
    },

    priority: {
        type: Number,
        enum: [1, 2, 3],
        default: 1
    },

    title: {
        type: String,
        required: true
    },

    body: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },

    answer: {
        type: Number,
        enum: [0, 1],
        default: 0
    },

    orderId: {
        type: mongoose.Types.ObjectId,
        ref: "Order",
    },

    sellerId: {
        type: mongoose.Types.ObjectId,
        ref: "Seller",
    },

    productId: {
        type: mongoose.Types.ObjectId,
        ref: "Product",
    },

    parent: {
        type: mongoose.Types.ObjectId,
        ref: "Ticket"
    },

    isAnswer: {
        type: Number,
        enum: [0, 1],
        default: 0
    }

}, { timestamps: true })

const model = mongoose.models.Ticket || mongoose.model("Ticket", schema)
module.exports = model
