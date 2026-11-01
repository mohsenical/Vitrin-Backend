const mongoose = require("mongoose")

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },

    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    },

    quantity: {
        type: Number,
        required: true,
        min: 1
    },

    priceAtTimeOfPurchase: {
        type: Number,
        required: true,
    },
})

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [orderItemSchema],

    shippingAddress: {
        postalCode: {
            type: String,
            required: true
        },
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
    },

    postTrackingCode: {
        type: String,
    },

    status: {
        type: String,
        enum: ["PROCESSING", "SHIPPED", "DELIVERED"],
        default: "PROCESSING",
    },

    authority: {
        type: String,
        unique: true,
        reqiured: true
    }

}, { timestamps: true })

orderSchema.virtual("totlaPrice").get(function () {
    return this.items.reduce((total, item) => {
        return total + item.priceAtTimeOfPurchase * item.quantity
    }, 0)
})

const model = mongoose.models.Order || mongoose.model("Order", orderSchema);
module.exports = model