const mongoose = require("mongoose")


const schema = new mongoose.Schema({
    
    title: {
        type: String,
        required: true
    },

    parent: {
        type: mongoose.Types.ObjectId,
        ref: "Department",
    }

}, { timestamps: true })

const model = mongoose.models.SubDepartment || mongoose.model("SubDepartment", schema)
module.exports = model
