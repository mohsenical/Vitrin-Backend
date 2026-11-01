const { isValidObjectId } = require("mongoose");

const productModel = require("../../models/Product")
const offModel = require("../../models/Off")

const { createOffValidator, setOnOffValidator, editOffsValidator } = require("../../validators/off");
const { errorResponse, successResponse } = require("../../helpers/responses");
const { createPaginationData } = require("../../utils/PaginationData");

exports.getAll = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const offs = await offModel.find({}, "-__v")
            .populate("createtor", "username")
            .populate("product", "name slug")
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()

        const totalOffs = await offModel.countDocuments()

        return successResponse(res, 200, {
            offs,
            pagination: createPaginationData(page, limit, totalOffs, "Offs")
        })
    } catch (err) {
        next(err)
    }
}

exports.create = async (req, res, next) => {
    try {
        const { code, percent, productId, max } = req.body
        const user = req.user;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Product ID is not valid !!")
        }

        await createOffValidator.validate(req.body, { ebortEarly: false });

        const product = await productModel.findById(productId)
        if (!product) {
            return errorResponse(res, 404, "Product not found !!")
        }

        const newOff = await offModel.create({
            code,
            percent,
            product: product._id,
            max,
            createtor: user._id,
        })

        return successResponse(res, 201, {
            message: "Off code created successfully :))",
            newOff
        })
    } catch (err) {
        next(err)
    }
}

exports.setOnAll = async (req, res, next) => {
    try {
        const { discount } = req.body;

        await setOnOffValidator.validate(req.body, { ebortEarly: false })

        const productDiscount = await productModel.updateMany({}, { $set: { discount } })

        if (!productDiscount) {
            return errorResponse(res, 403, "The discount code failed !!")
        }

        return successResponse(res, 200, {
            message: "Discount code set successfully :))",
        })
    } catch (err) {
        next(err)
    }
}

exports.getOne = async (req, res, next) => {
    try {
        const { code } = req.params;
        const { productId } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Product ID is not valid !!")
        }

        const filters = {
            code,
            product: productId
        }

        const off = await offModel.findOne(filters)

        if (!off) {
            return errorResponse(res, 404, "Off code not found !!")
        } else if (off.max === off.uses) {
            return errorResponse(res, 409, "This code already uses !!")
        } else {
            const updatedOff = await offModel.findOneAndUpdate(filters, { uses: off.uses + 1 }, { new: true })

            return successResponse(res, 200, {
                off: updatedOff
            })
        }
    } catch (err) {
        next(err)
    }
}

exports.remove = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 200, "Off ID is not valid !!")
        }

        const deletedOff = await offModel.findOneAndDelete({ _id: id })
        if (!deletedOff) {
            return errorResponse(res, 404, "Off not found !!")
        }

        return successResponse(res, 200, {
            message: "Off remove successfully :))",
            off: deletedOff
        })

    } catch (err) {
        next(err)
    }
}

exports.edit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { code, percent, productId } = req.body;

        await editOffsValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Off ID is not valid !!")
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

        const editedOff = await offModel.findOneAndUpdate({ _id: id }, {
            code,
            percent,
            product: productId,
        }, { new: true })

        if (!editedOff) {
            return errorResponse(res, 404, "Off not found !!")
        }

        return successResponse(res, 200, {
            message: "Off updated successfully :))",
            off: editedOff
        })
    } catch (err) {
        next(err)
    }
}
