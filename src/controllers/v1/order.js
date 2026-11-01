const { isValidObjectId } = require("mongoose");

const orderModel = require("../../models/Order");

const { successResponse, errorResponse } = require("../../helpers/responses");
const { createPaginationData } = require("../../utils/PaginationData");
const { updateOrderValidator } = require("../../validators/order")

exports.getAllOrders = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user = req.user;

        const hasAccessRole = user.roles.some(role => role === "OWNER" || role === "ADMIN")

        const filters = {
            ...(hasAccessRole ? {} : { user: user._id })
        }

        const orders = await orderModel.find(filters)
            .sort({ createdAt: "desc" })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("user")
            .populate("items.product")
            .populate("items.seller")

        const totalOrders = await orderModel.countDocuments(filters)

        return successResponse(res, 200, {
            orders,
            pagination: createPaginationData(page, limit, totalOrders, "Order")
        })

        return res.json({ message: "200" })

    } catch (err) {
        next(err)
    }
}

exports.updateOrder = async (req, res, next) => {
    try {
        const user = req.user;
        const { postTrackingCode, status } = req.body;
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Order ID is not valid !!")
        }

        await updateOrderValidator.validate(req.body, { ebortEarly: false })

        const order = await orderModel.findOneAndUpdate({ _id: id }, {
            postTrackingCode,
            status
        }, { new: True })

        if (!order) {
            return errorResponse(res, 404, "Order not found !!")
        }

        return successResponse(res, 200, {
            message: "Order updated successfully :))",
            order
        })

    } catch (err) {
        next(err)
    }
}