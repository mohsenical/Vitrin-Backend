const cartModel = require("../../models/Cart")
const checkoutModel = require("../../models/Checkout")
const orderModel = require("../../models/Order")
const productModel = require("../../models/Product")

const { successResponse, errorResponse } = require("../../helpers/responses")
const { createPayment, verifyPayment } = require("../../services/zarinpal")
const { createCheckoutValidator } = require("../../validators/checkout")

exports.createCheckout = async (req, res, next) => {
    try {
        const user = req.user;
        const { shippingAddress } = req.body;

        await createCheckoutValidator.validate(req.body, { ebortEarly: false })

        const cart = await cartModel.findOne({ user: user._id })
            .populate("items.product")
            .populate("items.seller")

        if (!cart?.items?.length) {
            return errorResponse(res, 404, "Cart is empty or not found !!")
        }

        const checkoutItems = []

        for (const item of cart.items) {
            const { product, seller } = item;

            const sellerDetails = product.sellers.map(sellerInfo => sellerInfo.seller.toString() === seller._id.toString());
            if (!sellerDetails) {
                return errorResponse(res, 400, "Seller dose not sell to this product !!")
            }

            checkoutItems.push({
                product: product._id,
                seller: seller._id,
                quantity: item.quantity,
                priceAtTimeOfPurchase: sellerDetails.price
            })
        }

        const newCheckout = new checkoutModel({
            user: user._id,
            items: checkoutItems,
            shippingAddress
        })

        const payment = await createPayment({
            amountInReiyal: newCheckout.totlaPrice,
            description: `سفارش با شناسه ${newCheckout._id}`,
            mobile: user.phone
        });

        newCheckout.authority = payment.authority;

        await newCheckout.save()

        return successResponse(res, 201, {
            message: "Checkout created successfully :))",
            checkout: newCheckout,
            paymentUrl: payment.paymentUrl
        })

    } catch (err) {
        next(err)
    }
}

exports.verifyCheckout = async (req, res, next) => {
    try {
        const { Status, Authority: authority } = req.query;

        const alreadyCreateOrder = await orderModel.findOne({ authority });
        if (alreadyCreateOrder) {
            return errorResponse(res, 400, "Payment already verifyed !!");
        };

        const checkout = await checkoutModel.findOne({ authority });
        if (!checkout) {
            return errorResponse(res, 404, "Checkout not found !!");
        };

        const payment = await verifyPayment({
            amountInReiyal: checkout.totlaPrice,
            authority
        })

        if (![101, 100].includes(payment.code)) {
            return errorResponse(res, 4000, "Payment not verified !!")
        } 

        const order = new orderModel({
            user: checkout.user,
            authority: checkout.authority,
            items: checkout.items,
            shippingAddress: checkout.shippingAddress,
        })

        await order.save()

        for ( const item of checkout.items ) {
            const product = await productModel.findById(item.product);

            if (product) {
                const sellerDetails = product.sellers.find((sellerInfo) => sellerInfo.selle.toString() === item.seller.toString())

                sellerDetails.stock -= item.quantity;
                await product.save()
            }
        }

        const cart = await cartModel.findOneAndUpdate({ user: checkout.user }, { items: [] });
        await checkout.deleteOne({ _id: checkout._id })

        return successResponse(res, 201, {
            message: "Payment success verified :))",
            order
        })
        
    } catch (err) {
        next(err)
    }
}