const { isValidObjectId } = require("mongoose")

const cartModel = require("../../models/Cart")
const productModel = require("../../models/Product")
const sellerModel = require("../../models/Seller")

const { errorResponse, successResponse } = require("../../helpers/responses")
const { addToCartValidator, removeFromCartValidator } = require("../../validators/cart")


exports.getCart = async (req, res, next) => {
    try {
        const user = req.user;

        const cart = await cartModel.findOne({ user: user._id })
            .populate({
                path: "items",
                populate: {
                    path: "product"
                }
            })
            .populate({
                path: "items",
                populate: {
                    path: "seller"
                }
            });

        if (!cart) {
            return errorResponse(res, 404, "Cart not found for this user !!")
        }

        return successResponse(res, 200, {
            cart
        })
    } catch (err) {
        next(err)
    }
}

exports.addToCart = async (req, res, next) => {
    try {
        const user = req.user;
        const { productId, sellerId, quantity } = req.body;

        if (!isValidObjectId(productId) || !isValidObjectId(sellerId)) {
            return errorResponse(res, 400, "Product or Seller ID is not valid !!");
        };

        await addToCartValidator.validate(req.body, { ebortEarly: false })

        const product = await productModel.findById(productId);
        if (!product) {
            return errorResponse(res, 404, "Product not found !!");
        };

        const seller = await sellerModel.findById(sellerId);
        if (!seller) {
            return errorResponse(res, 404, "Seller not found !!");
        };

        const sellerDitails = product.sellers.find(sellerInfo => sellerInfo.seller.toString() === sellerId.toString());
        if (!sellerDitails) {
            return errorResponse(res, 400, "Seller does not sellthis product !!")
        }

        const cart = await cartModel.findOne({ user: user._id })

        const priceAtTimeOfAdding = sellerDitails.price;

        if (!cart) {
            const newCart = await cartModel.create({
                user: user._id,
                items: {
                    product: productId,
                    seller: sellerId,
                    quantity,
                    priceAtTimeOfAdding,
                }
            })

            return successResponse(res, 201, {
                cart: newCart
            })
        }

        const existingItem = cart.items.find(item => {
            return item.product.toString() === productId && item.seller.toString() === sellerId
        })

        if (existingItem) {
            existingItem.quantity += quantity
            existingItem.priceAtTimeOfAdding += priceAtTimeOfAdding
        } else {
            cart.items.push({
                product: productId,
                seller: sellerId,
                quantity,
                priceAtTimeOfAdding
            });
        }

        await cart.save()

        return successResponse(res, 200, {
            cart
        })

    } catch (err) {
        next(err)
    }
}

exports.removeFromCart = async (req, res, next) => {
    try {
        const user = req.user;
        const { sellerId, productId } = req.body;

        if (!isValidObjectId(productId) || !isValidObjectId(sellerId)) {
            return errorResponse(res, 400, "Seller and Product ID is not valid !!");
        };

        await removeFromCartValidator.validate(req.body, { ebortEarly: false });

        const cart = await cartModel.findOne({ user: user._id })
        if (!cart) {
            return errorResponse(res, 404, "Cart not found for the user !!")
        }

        const itemIndex = cart.items.findIndex(item => item.seller.toString() === sellerId.toString() && item.product.toString() === productId.toString());
        if (itemIndex === -1) {
            return errorResponse(res, 404, "Cart not found is your found !!")
        }

        cart.items.splice(itemIndex, 1);

        await cart.save()

        return successResponse(res, 200, {
            message: "Cart remove successfully :))",
            cart
        })


    } catch (err) {
        next(err)
    }
}