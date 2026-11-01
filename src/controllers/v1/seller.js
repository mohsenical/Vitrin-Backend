const { isValidObjectId } = require("mongoose");

const { successResponse, errorResponse } = require("../../helpers/responses");
const sellerModel = require("../../models/Seller")

const { createSellerValidator, updateSellerValidator } = require("../../validators/seller");
const cities = require("../../cities/cities.json");


exports.create = async (req, res, next) => {
    try {
        const { name, contactDetails, cityId } = req.body;
        const user = req.user;

        await createSellerValidator.validate(req.body, { ebortEarly: false });

        const existingSeller = await sellerModel.findOne({ user: user._id })
        if (existingSeller) {
            return errorResponse(res, 400, "Seller already existing !!")
        }

        const city = await cities.find(city => +cityId === +city.id)
        if (!city) {
            return errorResponse(res, 409, "City is not Valid !!")
        }

        const seler = await sellerModel.create({
            name,
            contactDetails,
            cityId,
            user: user._id
        })

        return successResponse(res, 201, {
            message: "Seller create successfully :))"
        })

    } catch (err) {
        next(err);
    }
}

exports.get = async (req, res, next) => {
    try {
        const user = req.user;

        const seller = await sellerModel.findOne({ user: user._id }).lean()
        if (!seller) {
            return errorResponse(res, 404, "Seller not found !!")
        }

        return successResponse(res, 200, {
            seller
        })
    } catch (err) {
        next(err)
    }
}


exports.updateSeller = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, contactDetails, cityId } = req.body;

        await updateSellerValidator.validate(req.body, { ebortEarly: false })

        const seller = await sellerModel.findOne({ user: user._id })
        if (!seller) {
            return errorResponse(res, 404, "Seller not found !!")
        }

        const city = await cities.find(city => +city.id === +cityId);
        if (!city) {
            return errorResponse(res, 409, "City is not valid !!")
        }

        seller.name = name || seller.name
        seller.contactDetails = contactDetails || seller.contactDetails
        seller.cityId = cityId || seller.cityId

        await seller.save()

        return successResponse(res, 200, {
            seller,
            message: "Sellet updated successfully :)"
        })

    } catch (err) {
        next(err)
    }
}

exports.deleteSeller = async (req, res, next) => {
    try {
        const user = req.user;

        const existingSeller = await sellerModel.findOne({ user: user._id })
        if (!existingSeller) {
            return errorResponse(res, 400, "Seller not found !!")
        }

        await existingSeller.deleteOne();

        //TODO: Delete Products
        //TODO: Delete Products from shopping card

        return successResponse(res, 200, {
            message: "Seller deleted successfully :)",
            seller: existingSeller
        })

    } catch (err) {
        next(err)
    }
}