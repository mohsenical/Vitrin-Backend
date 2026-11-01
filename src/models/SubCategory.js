const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },

    parent: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: true
    },

    description: {
        type: String,
        trim: true
    },

    filters: {
        type: [
            {
                name: {
                    type: String,
                    required: true,
                    trim: true
                },

                slug: {
                    type: String,
                    unique: true,
                    required: true,
                    trim: true
                },

                description: {
                    type: String,
                    trim: true
                },

                type: {
                    type: String,
                    enum: ["selectbox", "radio"],
                    required: true,
                },

                options: {
                    type: [String],
                    default: undefined,
                    validate: {
                        validator: (options) => Array.isArray(options),
                    }
                },

                max: { type: Number },
                min: { type: Number },
            }
        ]
    }

})

const model = mongoose.models.SubCategory || mongoose.model("SubCategory", schema)
module.exports = model