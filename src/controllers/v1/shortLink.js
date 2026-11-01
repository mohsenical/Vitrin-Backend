const { errorResponse } = require("../../helpers/responses");
const productModel = require("../../models/Product")

exports.redirectToProduct = async (req, res, next) => {
    try {
        const { shortIdentifier } = req.params;

        const product = await productModel.findOne({ shortIdentifier })
        if (!product) {
            return errorResponse(res, 404, "Product not found !!")
        }

        return res.redirect(`/api/v1/products/${product._id}`)
    } catch (err) {
        next(err)
    }
}