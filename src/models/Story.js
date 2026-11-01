const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        default: null
    },

    media: {
        type: {
            fileName: { type: String, required: true, trim: true },
            path: { type: String, required: true, trim: true },
        }
    },

    title: {
        type: String,
        trim: true,
        default: ""
    },

    description: {
        type: String,
        trim: true,
        default: ""
    },

    link: {
        type: String,
        trim: true,
        default: null
    },

    typeMedia: {
        type: String,
        enum: ["video", "image"],
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    },

    expireAt: {
        type: Date,
        default: new Date(Date.now() + 24 * 60 * 60 * 1000),
        required: true,
    },

    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],

    viewsCount: {
        type: Number,
        default: 0
    },
}, { timestamps: true })

schema.index({
    isActive: 1,
    expiresAt: 1,
    createdAt: -1
});


const model = mongoose.models.Story || mongoose.model("Story", schema)
module.exports = model