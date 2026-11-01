const mongoose = require("mongoose")


const schema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    }
}, { timestamps: true })

const model = mongoose.models.NewLetter || mongoose.model("NewLetter", schema)
module.exports = model
