const { isValidObjectId } = require("mongoose");

const productModel = require("../../models/Product");
const sellerModel = require("../../models/Seller");
const sellerRequestModel = require("../../models/SellerRequest");

const { errorResponse, successResponse } = require("../../helpers/responses");
const { createSellerRequestValidator, updateSellerRequestValidator } = require("../../validators/sellerRequest");
const { createPaginationData } = require("../../utils/PaginationData");

exports.getAllSellerRequests = async (req, res, next) => {
    try {
        const { status = "pending", page = 1, limit = 10 } = req.query;
        const user = req.user;

        const seller = await sellerModel.findOne({ user: user._id });
        if (!seller) {
            return errorResponse(res, 404, "Seller not found !!")
        }

        const filters = {
            seller: seller._id,
            status
        }

        const sellerRequests = await sellerRequestModel.find(filters)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)



        const totalSellerRequest = await sellerRequestModel.countDocuments(filters)
        console.log(seller);


        return successResponse(res, 200, {
            sellerRequests,
            pagination: createPaginationData(page, limit, totalSellerRequest, "SellerRequest")
        })

    } catch (err) {
        next(err)
    }
}

exports.createSellerRequest = async (req, res, next) => {
    try {
        const user = req.user;
        const { productId, price, stock } = req.body;

        if (!isValidObjectId(productId)) {
            return errorResponse(res, 400, "Product ID is not valid !!")
        }

        await createSellerRequestValidator.validate(req.body, { ebortEarly: false })

        const seller = await sellerModel.findOne({ user: user._id });
        if (!seller) {
            return errorResponse(res, 40, "Seller not found !!")
        }

        const product = await productModel.findOne({ _id: productId });
        if (!product) {
            return errorResponse(res, 404, "product not found !!")
        }

        const existingRequest = await sellerRequestModel.findOne({
            seller: seller._id,
            product: productId
        });

        if (existingRequest) {
            return errorResponse(res, 400, "Request allready exist !!")
        };

        const newSellerrequest = await sellerRequestModel.create({
            seller: seller._id,
            product: productId,
            price,
            stock,
            status: "pending",
        })

        return successResponse(res, 201, {
            message: "Seller request submitted successfully :))",
            request: newSellerrequest
        })

    } catch (err) {
        next(err)
    }
}

exports.deleteSellerRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Seller request ID is not valid !!")
        };

        const sellerRequest = await sellerRequestModel.findById(id)
        if (!sellerRequest) {
            return errorResponse(res, 404, "Seller request not found !!")
        }

        const seller = await sellerModel.findOne({ user: user._id })
        if (!seller) {
            return errorResponse(res, 404, "Seller not found !!")
        }

        if (sellerRequest.seller.toString() !== seller._id.toString()) {
            return errorResponse(res, 403, "You hav not access to this seller request !!")
        }

        if (sellerRequest.status !== "pending") {
            return errorResponse(res, 400, "Seller request already reject or accept, cannot be deleted !!")
        }

        await sellerRequestModel.findOneAndDelete({ _id: id })

        return successResponse(res, 200, {
            message: "Seller request deleted successfully :))"
        })

    } catch (err) {
        next(err)
    }
}

exports.updateSellerRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminComment } = req.body;

        if (!isValidObjectId(id)) {
            return errorResponse(res, 400, "Seller request ID is not valid !!")
        }

        await updateSellerRequestValidator.validate(req.body, { ebortEarly: false })

        const sellerRequest = await sellerRequestModel.findOne({ _id: id })
        if (!sellerRequest) {
            return errorResponse(res, 404, "Seller request not found !!")
        }

        if (status === "reject") {

            sellerRequest.status = "rejected",
                adminComment ? sellerRequest.adminComment = adminComment : null

            await sellerRequest.save()

            return successResponse(res, 200, {
                message: "Seller request rejected !!",
                sellerRequest
            })

        } else if (status === "accept") {

            const product = await productModel.findOne({ _id: sellerRequest.product });
            
            if (!product) {
                return errorResponse(res, 404, "Product not found !!")
            }
            
            const existingSeller = product.sellers.find(seller => seller.seller.toString() === sellerRequest.seller.toString());
            if (existingSeller) {
                return successResponse(res, 400, "Seller already exists for this product !!")
            }

            product.sellers.push({
                seller: sellerRequest.seller,
                price: sellerRequest.price,
                stock: sellerRequest.stock
            })

            await product.save()

            sellerRequest.status = "accepted"

            await sellerRequest.save()

            return successResponse(res, 200, "Seller request accepted successfully and added to the product :)) ")
        }

    } catch (err) {
        next(err)
    }
}
