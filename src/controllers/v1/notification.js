const { isValidObjectId } = require("mongoose");

const notificationModel = require("../../models/Notification")
const userModel = require("../../models/User")

const { errorResponse, successResponse } = require("../../helpers/responses");
const { createNotificationValidator, editNotificationValidator } = require("../../validators/notification");
const { createPaginationData, } = require("../../utils/PaginationData");

exports.create = async (req, res, next) => {
    try {
        const user = req.user
        const { userId, message, owner } = req.body;

        await createNotificationValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "User ID is not valid !!")
        }

        const existingUser = await userModel.findOne({ _id: userId })
        if (!existingUser) {
            return errorResponse(res, 404, "User not found !!")
        }

        const notification = await notificationModel.create({
            owner: user._id,
            message,
            user: userId
        })

        return successResponse(res, 201, {
            message: "notification send successfully :))",
            notification
        })

    } catch (err) {
        next(err)
    }
}

exports.getAll = async (req, res, next) => {
    try {
        const { seen, page = 1, limit = 20 } = req.query

        let filter = {}

        if (seen) {
            if (seen === "1") {
                filter.seen = 1
            } else if (seen === "0") {
                filter.seen = 0
            }
        }

        const notifications = await notificationModel.aggregate([
            { $match: filter },
            {
                $lookup: {
                    from: "users",
                    localField: "User",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $project: {
                                username: 1
                            }
                        }
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
            { $skip: (page - 1) * limit },
            { $limit: +limit }
        ])

        const totalNotifications = await notificationModel.countDocuments()

        return successResponse(res, 200, {
            notifications,
            pagination: createPaginationData(page, limit, totalNotifications, "Notifications")
        })
    } catch (err) {
        next(err)
    }
}

exports.editNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const { message, userId } = req.body;

        await editNotificationValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Notification ID is not valid !!")
        }

        if (userId) {
            if (!isValidObjectId(userId)) {
                return errorResponse(res, 400, "User ID is not valid !!")
            }

            const existingUser = await userModel.findOne({ _id: userId })
            if (!existingUser) {
                return errorResponse(res, 404, "User not found !!")
            }
        }

        const notification = await notificationModel.findOne({ _id: id })
        if (!notification) {
            return errorResponse(res, 404, "Notification not found !!")
        }

        if (notification.owner.toString() !== user._id.toString()) {
            return errorResponse(res, 403, "You do not own this notifications !!")
        }

        if (notification.seen === 1) {
            return errorResponse(res, 403, "This notification has bee seen and can not bee edited !!")
        }

        notification.message = message || notification.message
        notification.user = userId || notification.user

        await notification.save()

        return successResponse(res, 200, {
            message: "notification edited successfully :))",
            notification
        })
    } catch (err) {
        next(err)
    }
}

exports.deletedNotification = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Notification ID is not valid !!")
        }

        const notification = await notificationModel.findOne({ _id: id })
        if (!notification) {
            return errorResponse(res, 404, "Notification not found !!")
        }

        if (notification.owner.toString() !== user._id.toString()) {
            return errorResponse(res, 403, "You do not own this notifications !!")
        }

        if (notification.seen === 1) {
            return errorResponse(res, 403, "This notification has bee seen and can not bee deleted !!")
        }

        const deletedNotification = await notificationModel.findOneAndDelete({ _id: id })


        return successResponse(res, 200, {
            message: "Notification deleted successfully :))",
            notification: deletedNotification
        })
    } catch (err) {
        next(err)
    }
}

exports.getOne = async (req, res, next) => {
    try {
        const user = req.user;

        const notifications = await notificationModel.find({ user: user._id })

        if (!notifications) {
            return errorResponse(res, 409, "You hav no notifications !!")
        }

        return successResponse(res, 200, {
            notifications
        })

    } catch (err) {
        next(err)
    }
}

exports.seen = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Notification ID is not valid !!")
        }

        const notification = await notificationModel.findOneAndUpdate({ _id: id }, {
            seen: 1
        }, { new: true })

        if (!notification) {
            return errorResponse(res, 404, "Notification not found !!")
        }

        return successResponse(res, 200, {
            message: "Notification was seen :))",
            notification
        })
    } catch (err) {
        next(err)
    }
}
