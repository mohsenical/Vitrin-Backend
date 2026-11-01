const { default: nodemailer } = require("nodemailer");

const newLetterModel = require("../../models/NewLetter");

const { successResponse, errorResponse } = require("../../helpers/responses");
const { createPaginationData } = require("../../utils/PaginationData");
const { createNewLetterValidator, answerNewLetterValidator } = require("../../validators/newLetter");

exports.getAll = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const newLetter = await newLetterModel.find({})
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        const totalNewLetter = await newLetterModel.countDocuments()

        return successResponse(res, 200, {
            newLetter,
            pagination: createPaginationData(page, limit, totalNewLetter, "NewLetter")
        })
    } catch (err) {
        next(err)
    }
}

exports.create = async (req, res, next) => {
    try {
        const { email } = req.body;

        await createNewLetterValidator.validate(req.body, { ebortEarly: false })

        const exsitingNewLetter = await newLetterModel.findOne({ email })
        if (exsitingNewLetter) {
            return errorResponse(res, 403, "The email already exists.")
        }

        const newLetter = await newLetterModel.create({ email })

        return successResponse(res, 201, {
            newLetter
        })
    } catch (err) {
        next(err)
    }
}

exports.answer = async (req, res, next) => {
    try {
        const { subject, answer } = req.body;

        await answerNewLetterValidator.validate(req.body, { ebortEarly: false })

        const newLatters = await newLetterModel.find({}).lean()
        if (!newLatters.length) {
            return errorResponse(res, 404, "No email registered. !!")
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PATH,
            }
        })

        for (const newLetter of newLatters) {

            const mailOption = {
                from: process.env.MAIL_USER,
                to: newLetter.email,
                subject,
                html: answer
            }

            await transporter.sendMail(mailOption, (err, info) => {
                if (err) {
                    return errorResponse(res, 409, `error: ${err}`)
                }
            })
        }

        return successResponse(res, 200, {
            message: "The answer was sent to everyone :))",
            data: {
                subject,
                answer
            }
        })
    } catch (err) {
        next(err)
    }
}