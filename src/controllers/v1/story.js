const { isValidObjectId } = require("mongoose");
const fs = require("fs")
const path = require("path")

const productModel = require("../../models/Product")
const storyModel = require("../../models/Story")

const { errorResponse, successResponse } = require("../../helpers/responses");
const { createPaginationData } = require("../../utils/PaginationData");
const { createStoryValidator } = require("../../validators/story");

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

exports.getStories = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const filter = {
            isActive: true,
            expireAt: {
                $gt: new Date()
            }
        }

        const stories = await storyModel.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        const totalStory = await storyModel.countDocuments(filter)

        return successResponse(res, 200, {
            stories,
            pagination: createPaginationData(page, limit, totalStory, "Story")
        })
    } catch (err) {
        next(err)
    }
}

exports.crateStory = async (req, res, next) => {
    try {
        const user = req.user
        const { productId, title, description, link } = req.body;

        await createStoryValidator.validate(req.body, { ebortEarly: false })

        const existingStory = await storyModel.findOne({ user: user._id, expireAt: { $gt: new Date() } })
        if (existingStory) {
            fs.unlinkSync(req.file.path)
            return errorResponse(res, 403, "You hav an active story !!")
        }

        if (productId) {
            if (!isValidObjectId(productId)) {
                return errorResponse(res, 400, "Product ID is not valid !!")
            }

            const product = await productModel.findById(productId)
            if (!product) {
                return errorResponse(res, 404, "Product not found !!")
            }
        }

        if (!req.file) {
            return errorResponse(res, 400, "Story media is required !!")
        }

        let typeMedia = null;
        let media = null

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

            media = {
                fileName: filename,
                path: `/stories/${typeMedia}/${filename}`
            }
        }

        const story = await storyModel.create({
            user: user._id,
            product: productId || null,
            media,
            typeMedia,
            title: title || "",
            description: description || "",
            link: link || "",
            isActive: true,
            viewers: [],
            viewCount: 0
        })

        await story.populate([
            {
                path: "user",
                select: "username"
            },
            {
                path: "product",
                select: "title"
            },
        ])

        return successResponse(res, 200, {
            story
        })
    } catch (err) {
        next(err)
    }
}

exports.getOneStory = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Story ID is not valid !!")
        }

        const story = await storyModel.findById(id)
            .populate("user", "username")
            .populate("product", "name slug")

        if (!story) {
            return errorResponse(res, 404, "Story not found !!")
        }

        return successResponse(res, 200, {
            story,
            storyCount: story.viewers.length
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteStory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Story ID is not valid !!")
        }

        let filter = {
            _id: id,
            user: user._id
        }

        const story = await storyModel.findOne(filter)
        if (!story) {
            return errorResponse(res, 404, "Story not found !!")
        }

        fs.unlink(path.join(__dirname, "../../../public", story.media.path), (err) => {
            if (err) {
                return new Error(err)
            }
        })

        const deletedStory = await storyModel.findOneAndDelete({ _id: story._id })

        return successResponse(res, 200, {
            message: "Story remove successfullt :))",
            story: deletedStory
        })
    } catch (err) {
        next(err)
    }
}

exports.getMyStories = async (req, res, next) => {
    try {
        const user = req.user;

        const story = await storyModel.findOne({ user: user._id })
            .populate("user", "username")
            .populate("product", "name slug")

        if (!story) {
            return errorResponse(res, 404, "Story not found !!")
        }

        return successResponse(res, 200, {
            story,
            storyCount: story.viewers.length
        })
    } catch (err) {
        next(err)
    }
}

exports.viewStory = async (req, res, next) => {
    try {
        const user = req.user;
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Story ID is not valid !!")
        }

        const filter = {
            _id: id,
            isActive: true,
            expireAt: {
                $gt: new Date()
            }
        }

        const story = await storyModel.findOne(filter)
        if (!story) {
            return errorResponse(res, 404, "Story not found !!")
        }

        if (story.user.toString() === user._id.toString()) {
            return successResponse(res, 200, {
                message: "owner View",
                viewsCount: story.viewsCount,
            })
        }

        const alreadyViwed = story.viewers.some(viewer => viewer.toString() === user._id.toString())

        if (alreadyViwed) {
            return successResponse(res, 200, {
                message: "Story already viewed",
                viewed: false,
                viewsCount: story.viewsCount
            })
        }

        story.viewers.push(user._id);
        story.viewsCount += 1;

        await story.save()


        return successResponse(res, 200, {
            message: "Story viewes successfully :))",
            viewed: true,
            viewsCount: story.viewsCount
        })
    } catch (err) {
        next(err)
    }
}
