const fs = require("fs")
const path = require("path")
const { default: nodemailer } = require("nodemailer");

const contactModel = require("../../models/ContactUS");

const { successResponse, errorResponse } = require("../../helpers/responses");
const { createContactValidator } = require("../../validators/contactUs");
const { isValidObjectId } = require("mongoose");
const { createPaginationData } = require("../../utils/PaginationData");


const supportedFormate = [
    "image/jpeg",
    "image/png",
    "image/svg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "video/mp4",
    "video/webm",
    "video/quicktime",
]

exports.getAll = async (req, res, next) => {
    try {
        const { answer, page = 1, limit = 10 } = req.query;

        let filter = {}

        if (answer) {
            if (answer === "1") {
                filter.answer = 1
            } else {
                filter.answer = 0
            }
        }

        const contacts = await contactModel.aggregate([
            { $match: filter },
            { $skip: (page - 1) * limit },
            { $limit: +limit }
        ])

        return successResponse(res, 200, {
            contacts,
            pagination: createPaginationData(page, limit, contacts.length, "ContactUs")
        })
    } catch (err) {
        next(err)
    }
}

exports.create = async (req, res, next) => {
    try {
        const { title, firstName, lastName, email, body } = req.body;

        await createContactValidator.validate(req.body, { ebortEarly: false })

        let file = null
        let typeMedia = null

        if (req.file) {
            const { filename, mimetype } = req.file;

            if (!supportedFormate.includes(mimetype)) {
                return errorResponse(res, 400, "Only image or video files are allowed !!")
            }

            if (mimetype.startsWith("image/")) {
                typeMedia = "image"
            } else if (mimetype.startsWith("video/")) {
                typeMedia = "video"
            } else {
                return errorResponse(res, 400, "Only image or video files are allowed !!")
            }

            file = {
                fileName: filename,
                path: `/contact-us/${typeMedia}/${filename}`
            }
        }

        const contact = await contactModel.create({
            title,
            firstName,
            lastName,
            email,
            file,
            typeMedia,
            body,
        })

        return successResponse(res, 201, {
            contact
        })
    } catch (err) {
        next(err)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Contact ID is not valid !!")
        }

        const contact = await contactModel.findOne({ _id: id })
        if (!contact) {
            return errorResponse(res, 404, "Contact not found !!")
        }

        fs.unlink(path.join(__dirname, "../../../public", contact.file.path), (err) => {
            if (err) {
                return new Error(err)
            }
        })

        const deletedContact = await contactModel.findOneAndDelete({ _id: contact._id })

        return successResponse(res, 200, {
            message: "Contact remove successfullt :))",
            contact: deletedContact
        })
    } catch (err) {
        next(err)
    }
}

exports.answer = async (req, res, next) => {
    try {
        const { email, answer } = req.body;

        await answerContactValidator.validate(req.body, { ebortEarly: false })

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PATH,
            },
        });

        let mailOption = {
            from: process.env.MAIL_USER,
            to: email,
            subject: "پاسخ پیغام شما از سمت اکادمی ویترین",
            html: answer,
        }

        await transporter.sendMail(mailOption, async (err, info) => {
            if (err) {
                return errorResponse(res, 409, `error: ${err}`)
            } else {

                const answer = await contactModel.findOneAndUpdate({ email }, {
                    answer: 1
                }, { new: true })

                return successResponse(res, 200, {
                    message: "Email send successfully :))"
                })
            }
        });
    } catch (err) {
        next(err)
    }
}
