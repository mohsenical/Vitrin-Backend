const { isValidObjectId } = require("mongoose")

const departmentModel = require("../../models/Department")
const subDepartmentModel = require("../../models/Department-sub")
const ticketModel = require("../../models/ticket")

const orderModel = require("../../models/Order")
const sellerModel = require("../../models/Seller")
const productsModel = require("../../models/Product")

const { createDepartmentValidator, editDepartmentValidator } = require("../../validators/departments")
const { createSubDepartmentValidator } = require("../../validators/subDepartment")
const { createTicketValidator, answerTicketValidator, editTicketValidator } = require("../../validators/ticket")

const { createPaginationData } = require("../../utils/PaginationData")
const { successResponse, errorResponse } = require("../../helpers/responses")

exports.createTicket = async (req, res, next) => {
    try {
        const user = req.user
        const { departmentId, departmentSubId, title, body, orderId, sellerId, productId } = req.body;

        await createTicketValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(departmentId)) {
            return errorResponse(res, 400, "DepartmentId ID is not valid !!")
        }

        const department = await departmentModel.findOne({ _id: departmentId })
        if (!department) {
            return errorResponse(res, 404, "Department not found !!")
        }

        if (!isValidObjectId(departmentSubId)) {
            return errorResponse(res, 400, "Sub Department ID is not valid !!")
        }

        const subDepartment = await subDepartmentModel.findOne({ _id: departmentSubId })
        if (!subDepartment) {
            return errorResponse(res, 404, "Sub department not found !!")
        }

        if (orderId) {
            if (!isValidObjectId(orderId)) {
                return errorResponse(res, 400, "Order ID not valid !!")
            }

            const order = await orderModel.findOne({ _id: orderId })
            if (!order) {
                return errorResponse(res, 404, "Order not found !!")
            }
        }

        if (sellerId) {
            if (!isValidObjectId(sellerId)) {
                return errorResponse(res, 400, "Seller ID not valid !!")
            }

            const seller = await sellerModel.findOne({ _id: sellerId })
            if (!seller) {
                return errorResponse(res, 404, "Seller not found !!")
            }
        }

        if (productId) {
            if (!isValidObjectId(productId)) {
                return errorResponse(res, 400, "Products ID not valid !!")
            }

            const product = await sellerModel.findOne({ _id: productId })
            if (!product) {
                return errorResponse(res, 404, "Product not found !!")
            }
        }

        const createTicket = await ticketModel.create({
            user: user._id,
            departmentId,
            departmentSubId,
            title,
            body,
            orderId,
            sellerId,
            productId,
        })

        const ticket = await ticketModel.findOne({ _id: createTicket._id })
            .populate("user", "-addresses")
            .populate("departmentId", "-createdAt -updatedAt -__v")
            .populate("departmentSubId")
            .populate("orderId")
            .populate("sellerId", "-contactDetails")
            .populate("productId")
            .lean()

        return successResponse(res, 201, {
            message: "Ticket creadted successfully :))",
            ticket
        })
    } catch (err) {
        next(err)
    }
}

exports.getAllTickets = async (req, res, next) => {
    try {
        const { priority, answer, page = 1, limit = 10 } = req.query;

        let filters = {}

        if (priority) {
            if (priority === "1") {
                filters.priority = 1
            } else if (priority === "2") {
                filters.priority = 2
            } else {
                filters.priority = 3
            }
        }

        if (answer) {
            if (answer === "0") {
                filters.answer = 0
            } else {
                filters.answer = 1
            }
        }

        const ticket = await ticketModel.aggregate([
            { $match: filters },

            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                username: 1
                            }
                        },
                    ],
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "departments",
                    localField: "departmentId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                title: 1
                            }
                        },
                    ],
                    as: "department"
                }
            },
            {
                $unwind: {
                    path: "$department",
                    preserveNullAndEmptyArrays: true
                }
            },

            {
                $lookup: {
                    from: "subdepartments",
                    localField: "departmentSubId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                title: 1
                            }
                        },
                    ],
                    as: "subDepartment"
                }
            },
            {
                $unwind: {
                    path: "$subDepartment",
                    preserveNullAndEmptyArrays: true
                }
            },

            { $skip: (page - 1) * limit },
            { $limit: +limit },
            { $sort: { createdAt: "desc" } }
        ])

        const totalTickets = await ticketModel.countDocuments(filters)

        return successResponse(res, 200, {
            ticket,
            pagination: createPaginationData(page, limit, totalTickets, "tickets")
        })
    } catch (err) {
        next(err)
    }
}

exports.removeTicket = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Ticket ID is not valid !!")
        }

        const deletedTicket = await ticketModel.findOneAndDelete({ _id: id })
        if (!deletedTicket) {
            return errorResponse(res, 404, "Ticket not found !!")
        }

        return successResponse(res, 200, {
            message: "Ticket remove successfully :))"
        })
    } catch (err) {
        next(err)
    }
}

exports.editTicket = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { departmentId, departmentSubId, title, body } = req.body;

        await editTicketValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Ticket ID is not valid !!")
        }

        if (departmentId) {
            if (!isValidObjectId(departmentId)) {
                return errorResponse(res, 400, "Department ID is not valid !!")
            }
        }

        if (departmentSubId) {
            if (!isValidObjectId(departmentSubId)) {
                return errorResponse(res, 400, "Sub Department ID is not valid !!")
            }
        }

        const ticket = await ticketModel.findOne({ _id: id })

        if (!ticket) {
            return errorResponse(res, 404, "Ticket not found !!")
        }

        ticket.departmentId = departmentId || ticket.departmentId
        ticket.departmentSubId = departmentSubId || ticket.departmentSubId
        ticket.title = title || ticket.title
        ticket.body = body || ticket.body

        await ticket.save()

        return successResponse(res, 200, {
            message: "Ticket updated successfully :))",
            ticket
        })
    } catch (err) {
        next(err)
    }
}

exports.userTickets = async (req, res, next) => {
    try {
        const user = req.user;

        const tickets = await ticketModel.find({ user: user._id })
            .sort({ createdAt: "desc" })
            .populate("departmentId", "title")
            .populate("departmentSubId", "title")
            .populate("user", "-addresses")
            .lean()

        if (!tickets) {
            return errorResponse(res, 404, "User Tickets not found !!")
        }

        let allTicket = []

        tickets.forEach(ticket => {
            tickets.forEach(ticketAnswer => {
                if (String(ticket._id) === String(ticketAnswer.parent)) {
                    allTicket.push({
                        ...ticket,
                        ticketAnswer
                    })
                }
            })
        })

        return successResponse(res, 200, {
            tickets: allTicket
        })
    } catch (err) {
        next(err)
    }
}

exports.departments = async (req, res, next) => {
    try {
        const departments = await departmentModel.find({}).lean()

        return successResponse(res, 200, {
            departments
        })
    } catch (err) {
        next(err)
    }
}

exports.createDepartment = async (req, res, next) => {
    try {
        const { title } = req.body;

        await createDepartmentValidator.validate(req.body, { ebortEarly: false })

        const departments = await departmentModel.create({ title })
        if (!departments) {
            return errorResponse(res, 403, "Create departments failed !!")
        }

        return successResponse(res, 201, {
            message: "Create department successfully :))",
            departments
        })
    } catch (err) {
        next(err)
    }
}

exports.removeDepatments = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Department ID is not valid !!")
        }

        const deletedDepartment = await departmentModel.findOneAndDelete({ _id: id })
        if (!deletedDepartment) {
            return errorResponse(res, 404, "Department not found !!")
        }

        return successResponse(res, 200, {
            message: "Department remove successfully !!"
        })
    } catch (err) {
        next(err)
    }
}

exports.editDepatments = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Department ID is not valid !!")
        }

        await editDepartmentValidator.validate(req.body, { ebortEarly: false })

        const editedDepartment = await departmentModel.findOneAndUpdate({ _id: id }, {
            title
        }, { new: true })

        if (!editedDepartment) {
            return errorResponse(res, 404, "Department ID not found !!")
        }

        return successResponse(res, 200, {
            message: "department updated successfully :))",
            department: editedDepartment
        })
    } catch (err) {
        next(err)
    }
}

exports.createSubDepatments = async (req, res, next) => {
    try {
        const { title, parent } = req.body;

        if (!isValidObjectId(parent)) {
            return errorResponse(res, 400, "Parent ID is not valid")
        }

        await createSubDepartmentValidator.validate(req.body, { ebortEarly: false })

        const parentDepartment = await departmentModel.findOne({ _id: parent })
        if (!parentDepartment) {
            return errorResponse(res, 404, "Parent department is not found !!")
        }

        const subDepartment = await subDepartmentModel.create({ title, parent })
        if (!subDepartment) {
            return errorResponse(res, 403, "Subdepartments create failed !!")
        }

        return successResponse(res, 201, {
            message: "Sub departments create successfully :))",
            subDepartment
        })
    } catch (err) {
        next(err)
    }
}

exports.editSubDepatments = async (req, res, next) => {

    try {
        const { title, parent } = req.body;
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Sub department ID is not valid")
        }

        await editDepartmentValidator.validate(req.body, { ebortEarly: false })

        const subDepartment = await subDepartmentModel.findById(id)
        if (!subDepartment) {
            return errorResponse(res, 404, "Sub Department is not found !!")
        }

        if (parent) {
            if (!isValidObjectId(parent)) {
                return errorResponse(res, 400, "Parent ID is not valid")
            }

            const parentDepartment = await departmentModel.findOne({ _id: parent })
            if (!parentDepartment) {
                return errorResponse(res, 404, "Parent department is not found !!")
            }
        }

        subDepartment.title = title || subDepartment.title
        subDepartment.parent = parent || subDepartment.parent

        await subDepartment.save()

        return successResponse(res, 200, {
            message: "Sub Department updated successfully :))",
        })

    } catch (err) {
        next(err)
    }
}

exports.removeSubDepatments = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Sub department ID is not valid")
        }

        const deletedSubDepartment = await subDepartmentModel.findOneAndDelete({ _id: id })
        if (!deletedSubDepartment) {
            return errorResponse(Res, 404, "Sub department not found !!")
        }

        return successResponse(res, 200, {
            message: "Sub department remove successfully :))"
        })
    } catch (err) {
        next(err)
    }
}

exports.departmentsSubs = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Departments ID is not valid !!")
        }

        const subDepartment = await subDepartmentModel.find({ parent: id }).lean()

        return successResponse(res, 200, {
            subDepartment
        })
    } catch (err) {
        next(err)
    }
}

exports.setAnswer = async (req, res, next) => {
    try {
        const { ticketId, body } = req.body;
        const user = req.user

        await answerTicketValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(ticketId)) {
            return errorResponse(res, 400, "ticket is not valid !!")
        }

        const ticket = await ticketModel.findById(ticketId)
        if (!ticket) {
            return errorResponse(res, 404, "Ticket not found !!")
        }

        const answer = await ticketModel.create({
            title: "پاسخ تیکت شما",
            body,
            parent: ticketId,
            priority: ticket.priority,
            user: user._id,
            isAnswer: 1,
            departmentId: ticket.departmentId,
            departmentSubId: ticket.departmentSubId,
        })

        await ticketModel.findOneAndUpdate({ _id: ticket._id }, {
            answer: 1
        });

        return successResponse(res, 201, {
            answer
        })

    } catch (err) {
        next(err)
    }
}

exports.deleteAnswer = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Ticet answer ID is not valid !!")
        }

        const deletedAnswer = await ticketModel.findOneAndDelete({ _id: id })
        if (!deletedAnswer) {
            return errorResponse(res, 404, "Ticket answer not found !!")
        }

        return successResponse(res, 200, {
            message: "Ticket remove successfully :))",
            ticket: deletedAnswer
        })
    } catch (err) {
        next(err)
    }
}

exports.editAnswer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { body } =  req.body;

        await answerTicketValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Ticet answer ID is not valid !!")
        }

        const editedAnswer = await ticketModel.findOneAndUpdate({ _id: id }, {
            body
        }, { new: true })

        if (!editedAnswer) {
            return errorResponse(res, 404, "Ticket answer not found !!")
        }

        return successResponse(res, 200, {
            message: "Ticket answer updated successfully :))",
            ticket: editedAnswer
        })

    } catch (err) {
        next(err)
    }
}

exports.getAnswer = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Ticket ID is not valid !!")
        }

        const ticket = await ticketModel.findOne({ _id: id })
        if (!ticket) {
            return errorResponse(res, 404, "Ticket not found !!")
        }

        const ticketAnswer = await ticketModel.find({ parent: ticket._id })

        return successResponse(res, 200, {
            ticket,
            ticketAnswer: ticketAnswer ? ticketAnswer : null
        })
    } catch (err) {
        next(err)
    }
}
