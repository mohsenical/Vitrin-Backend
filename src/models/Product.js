const mongoose = require("mongoose");
const { mixed } = require("yup");

const sellerSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        required: true
    }
})

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    discount: {
        type: Number,
        default: 0
    },

    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubCategory",
        required: true
    },

    images: {
        type: [
            {
                filename: {
                    type: String,
                    required: true,
                },
                path: {
                    type: String,
                    required: true,
                }
            }
        ],
    },

    sellers: {
        type: [sellerSchema],
        default: []
    },

    filterValues: {
        type: Map,
        of: mongoose.Types.Mixed,
        required: true
    },

    customFilters: {
        type: Map,
        of: String,
        required: true
    },

    shortIdentifier: {
        type: String,
        required: true,
        unique: true
    }

}, { timestamps: true });

const model = mongoose.models.Product || mongoose.model("Product", schema)
module.exports = model