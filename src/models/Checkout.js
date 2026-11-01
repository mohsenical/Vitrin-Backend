const mongoose = require("mongoose")

const checkoutItemSchema = new mongoose.Schema({
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
    }
})

const chekoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [checkoutItemSchema],

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

    authority: {
        type: String,
        unique: true,
        reqiured: true
    },

    expireAt: {
        type: Date,
        default: () => Date.now() + 60 * 60 * 1000,
        reqiured: true
    }

}, { timestamps: true })

chekoutSchema.virtual("totlaPrice").get(function () {
    return this.items.reduce((total, item) => {
        return total + item.priceAtTimeOfPurchase * item.quantity
    }, 0)
})

chekoutSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 })


const model = mongoose.models.Checkout || mongoose.model("Checkout", chekoutSchema);
module.exports = model