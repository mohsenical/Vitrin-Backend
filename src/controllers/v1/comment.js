const { isValidObjectId } = require("mongoose");

const commentModel = require("../../models/Comment");
const productModel = require("../../models/Product");

const { errorResponse, successResponse } = require("../../helpers/responses");
const { createCommentValidator, addReplyValidator } = require("../../validators/comment");
const { createPaginationData } = require("../../utils/PaginationData");


exports.getComments = async (req, res, next) => {
    try {
        const { productId } = req.query;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "product ID is not Valid !!")
        }

        const product = await productModel.findOne({ _id: productId })
        console.log(product);

        if (!product) {
            return errorResponse(res, 404, "Product not found !!")
        }

        const comments = await commentModel.find({ product: productId })
            .populate("user")
            .populate({
                path: "rating",
                populate: {
                    path: "user"
                }
            })

        return successResponse(res, 200, comments)

    } catch (err) {
        next(err)
    }
}

exports.createComment = async (req, res, next) => {
    try {
        const { productId, rating, content } = req.body;
        const user = req.user;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Product ID is not valid !!")
        }

        await createCommentValidator.validate(req.body, { ebortEarly: false })

        const product = await productModel.findOne({ _id: productId })
        if (!product) {
            return errorResponse(res, 404, "Product not found !!")
        }

        const newComment = await commentModel.create({
            product: productId,
            user: req.user,
            rating,
            content,
            replies: [],
        })

        return successResponse(res, 201, {
            message: "comment created successfully :))",
            comment: newComment
        })
    } catch (err) {
        next(err)
    }
}

exports.getAllComment = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const user = req.user

        const comments = await commentModel.find({})
            .sort({ createdAt: "desc" })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("product")
            .populate("user", "-addresses")
            .populate({
                path: "replies",
                populate: {
                    path: "user",
                    select: "-addresses"
                }
            })

        if (!comments) {
            return errorResponse(res, 400, "comments has Empty !!")
        }

        const totalComment = await commentModel.countDocuments()

        return successResponse(res, 200, {
            comments,
            pagenition: createPaginationData(page, limit, totalComment, "Comment")
        })
    } catch (err) {
        next(err)
    }
}

exports.updateComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        let { content, rating } = req.body;
        const user = req.user

        if (!isValidObjectId(commentId)) {
            return errorResponse(res, 400, "Comment ID is not valid !!")
        }

        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return errorResponse(res, 404, "Comment not found !!")
        }

        if (comment.user.toString() !== req.user._id.toString()) {
            return errorResponse(res, 403, "You hav not access to this action !!")
        }

        comment.content = content || comment.content;
        comment.rating = rating || comment.rating

        await comment.save();

        return successResponse(res, 200, {
            message: "Comment updated successfully :))",
            comment
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const user = req.user;

        if (!isValidObjectId(commentId)) {
            return errorResponse(res, 400, "Comment ID is not valid !!")
        }

        const deletedComment = await commentModel.findOneAndDelete({ _id: commentId })
        if (!deletedComment) {
            return errorResponse(res, 400, "Comment not found !!")
        }

        return successResponse(res, 200, {
            message: "comment deleted successfully :))",
            comment: deletedComment
        })
    } catch (err) {
        next(err)
    }
}

exports.acceptComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;

        if (!isValidObjectId(commentId)) {
            return errorResponse(res, 400, "Comment id is not valid !!")
        }

        const comment = await commentModel.findById(commentId)
        if (!comment) {
            return errorResponse(res, 404, "Comment not found !!")
        }

        console.log(comment);


        const acceptedComment = await commentModel.findOneAndUpdate({ _id: comment._id }, {
            isAccept: 1
        }, { new: true })

        if (!acceptedComment) {
            return errorResponse(res, 403, "accept commnet failed !!")
        }

        return successResponse(res, 200, {
            message: "Comment accept successfully :))",
            comment: acceptedComment
        })
    } catch (err) {
        next(err)
    }
}

exports.rejectComment = async (req, res, next) => {
    try {
        const { commentId } = req.params;

        if (!isValidObjectId(commentId)) {
            return errorResponse(res, 400, "Comment id is not valid !!")
        }

        const comment = await commentModel.findById(commentId)
        if (!comment) {
            return errorResponse(res, 404, "Comment not found !!")
        }

        const rejectedComment = await commentModel.findOneAndUpdate({ _id: comment._id }, {
            isAccept: 0
        }, { new: true })

        if (!rejectedComment) {
            return errorResponse(res, 403, "reject commnet failed !!")
        }

        return successResponse(res, 200, {
            message: "Comment reject successfully :))",
            comment: rejectedComment
        })
    } catch (err) {
        next(err)
    }
}

exports.addReply = async (req, res, next) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const user = req.user;

        if (!isValidObjectId(commentId)) {
            return errorResponse(res, 400, "Comment ID is not valid !!")
        }

        await addReplyValidator.validate(req.body, { ebortEarly: false })

        const reply = await commentModel.findOneAndUpdate(
            { _id: commentId },
            {
                $push: {
                    replies: {
                        user: user._id,
                        content
                    }
                }
            },
            { new: true }
        )

        if (!reply) {
            return errorResponse(res, 404, "Comment not found !!")
        }

        return successResponse(res, 201, {
            reply
        })
    } catch (err) {
        next(err)
    }
}

exports.updateReply = async (req, res, next) => {
    try {
        const { content } = req.body;
        const { commentId, replyId } = req.params;

        if (!isValidObjectId(commentId) || !isValidObjectId(replyId)) {
            return errorResponse(res, 200, "Replay or Comment ID is not valid !!")
        }

        const comment = await commentModel.findById(commentId);
        if (!comment) {
            return errorResponse(res, 404, "Comment not found !!")
        }

        const reply = comment.replies.find(reply => reply._id.toString() === replyId.toString())
        if (!reply) {
            return errorResponse(res, 404, "Reply not found !!")
        }

        reply.content = content || reply.content

        comment.save()

        return successResponse(res, 200, {
            message: "Reply updated successfully :))",
            comment
        })

    } catch (err) {
        next(err)
    }
}

exports.deleteReply = async (req, res, next) => {
    try {
        const { commentId, replyId } = req.params;
        const user = req.user

        if (!isValidObjectId(commentId) || !isValidObjectId(replyId)) {
            return errorResponse(res, 200, "Replay or Comment ID is not valid !!")
        }

        const comment = await commentModel.findOne({ _id: commentId })
        if (!comment) {
            return errorResponse(res, 404, "Comment not fornd !!");
        };

        const reply = comment.replies.id(replyId)
        if (!reply) {
            return errorResponse(res, 404, "Reply not found !!");
        }

        if (reply.user.toString() !== user._id.toString()) {
            return errorResponse(res, 403, "you hav not access to this action !!");
        }

        comment.replies.pull(replyId)

        await comment.save()

        successResponse(res, 200, {
            message: "Replay deleted successfully :))"
        })
    } catch (err) {
        next(err)
    }
}

exports.acceptReplyComment = async (req, res, next) => {
    try {
        const { commentId, replyId } = req.params;

        if (!isValidObjectId(commentId) || !isValidObjectId(replyId)) {
            return errorResponse(res, 400, "Comment and Reply ID is not valid !!")
        }

        const comment = await commentModel.findById(commentId)
        if (!comment) {
            return errorResponse(res, 404, "Comment not found !!")
        }

        const reply = comment.replies.find(reply => reply._id.toString() === replyId.toString())
        if (!reply) {
            return errorResponse(res, 404, "Reply not found !!")
        }

        reply.isAccept = 1

        await comment.save()

        return successResponse(res, 200, {
            message: "Reply accepted successfully :))"
        })

    } catch (err) {
        next(err)
    }
}

exports.rejectReplyComment = async (req, res, next) => {
    try {
        const { commentId, replyId } = req.params;

        if (!isValidObjectId(commentId) || !isValidObjectId(replyId)) {
            return errorResponse(res, 400, "Comment and Reply ID is not valid !!")
        }

        const comment = await commentModel.findById(commentId)
        if (!comment) {
            return errorResponse(res, 404, "Comment not found !!")
        }

        const reply = comment.replies.find(reply => reply._id.toString() === replyId.toString())
        if (!reply) {
            return errorResponse(res, 404, "Reply not found !!")
        }

        reply.isAccept = 0

        await comment.save()

        return successResponse(res, 200, {
            message: "Reply rejecetd successfully :))"
        })

    } catch (err) {
        next(err)
    }
}