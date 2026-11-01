const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        trim: true
    }
})

const model = mongoose.models.Ban || mongoose.model("Ban", schema)
module.exports = model