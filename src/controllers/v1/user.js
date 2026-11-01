const { isValidObjectId } = require("mongoose");

const userModel = require("../../models/User")
const banModel = require("../../models/Ban")

const { errorResponse, successResponse } = require("../../helpers/responses");
const { createAddressValidator, updateAddressValidator } = require("../../validators/address");

const cities = require("../../cities/cities.json");
const { createPaginationData } = require("../../utils/PaginationData");
const { createProfileValidator, updatedProfileValidator } = require("../../validators/profile");

exports.banUser = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await userModel.findOne({ _id: userId });
        if (!user) {
            return errorResponse(res, 404, "User not found !!")
        }

        if (user.roles.includes("ADMIN")) {
            return errorResponse(res, 403, "You cannot ban on [ADMIN] !!")
        }

        const deletedUser = await userModel.findOneAndDelete({ _id: user._id })

        await banModel.create({
            phone: user.phone
        })

        return successResponse(res, 200, {
            user: deletedUser,
            message: "User banned successfully, user and postes remove"
        })

    } catch (err) {
        next(err)
    }

}

exports.changeRole = async (req, res, next) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return errorResponse(res, 400, "User ID is not valid !!")
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return errorResponse(res, 404, "User not found !!")
        }

        let hasAdmin = user.roles.includes("ADMIN")

        const changeRole = user.roles.map(role => {
            if (role === "ADMIN") {
                return "USER"
            } else if (!hasAdmin && role === "USER") {
                return "ADMIN"
            }
            return role
        })

        const updatedUser = await userModel.findByIdAndUpdate(userId, {
            roles: changeRole
        }, { new: true })

        return successResponse(res, 200, {
            message: "User role updated successfully :))",
            user: updatedUser
        })

    } catch (err) {
        next(err)
    }
}

exports.createAddress = async (req, res, next) => {
    try {
        const user = req.user;
        const { name, postalCode, location, address, cityId } = req.body;

        await createAddressValidator.validate(req.body, { ebortEarly: false });

        const city = await cities.find((city) => +city.id === +cityId)
        if (!city) {
            return errorResponse(res, 409, "City is not Valid !!")
        }

        const addressObject = {
            name,
            postalCode,
            location,
            address,
            cityId,
        }

        const updateUser = await userModel.findOneAndUpdate({ _id: user.id }, {
            $push: { addresses: addressObject },
        }, {
            new: true
        })

        return successResponse(res, 200, {
            user: updateUser,
            message: "Address create successfully :)"
        })

    } catch (err) {
        next(err)
    }
}

exports.removeAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;

        if (!isValidObjectId(addressId)) {
            return errorResponse(res, 400, "Address ID is not valid !!")
        }

        const user = await userModel.findOne({ _id: req.user._id });

        const address = await user.addresses.id(addressId);
        if (!address) {
            return errorResponse(res, 404, "Address not found !!");
        }

        await user.addresses.pull(addressId);
        const updatedUser = await user.save();

        return successResponse(res, 200, {
            user: updatedUser,
            message: "Address deleted successfully :))",
        });

    } catch (err) {
        next(err)
    }
}

exports.updateAddress = async (req, res, next) => {
    try {
        const { addressId } = req.params;
        const { name, postalCode, location, address, cityId } = req.body;

        await updateAddressValidator.validate(req.body, { ebortEarly: false });

        if (!isValidObjectId(addressId)) {
            return errorResponse(res, 400, "Address ID is not valid !!")
        }

        const user = await userModel.findOne({ _id: req.user._id });
        if (!user) {
            return errorResponse(res, 404, "User not found !!");
        };

        const userAddress = await user.addresses.id(addressId);
        if (!userAddress) {
            return errorResponse(res, 404, "Address not found !!");
        };

        userAddress.name = name || userAddress.name;
        userAddress.postalCode = postalCode || userAddress.postalCode;
        userAddress.location = location || userAddress.location;
        userAddress.address = address || userAddress.address;
        userAddress.cityId = cityId || userAddress.cityId;

        const updatedUser = await user.save();

        return successResponse(res, 200, {
            user: updatedUser,
            message: "Address Updated successfully :))"
        })

    } catch (err) {
        next(err);
    }
}

exports.getAll = async (req, res, next) => {
    try {
        let { page = 1, limit = 5 } = req.query;

        const users = await userModel.find({}).lean().skip((page - 1) * limit).limit(limit);

        const totalUsers = await userModel.countDocuments();

        return successResponse(res, 200, {
            users,
            pagination: createPaginationData(page, limit, totalUsers, "User")
        });
    } catch (err) {
        next(err);
    }
}

exports.createProfile = async (req, res, next) => {
    try {
        const user = req.user;
        const { username, firstName, lastName, birthday, nationalCode, email } = req.body;

        await createProfileValidator.validate(req.body, { ebortEarly: false })

        const existingUsername = await userModel.findOne({ username })
        if (existingUsername) {
            return errorResponse(res, 409, "Username already existing !!")
        }

        const profileObject = {
            firstName,
            lastName,
            birthday,
            nationalCode,
            email: email || null,
        }

        const updateUser = await userModel.findOneAndUpdate({ _id: user._id }, {
            username,
            profile: profileObject
        }, { new: true })

        return successResponse(res, 200, {
            message: "user ditals updated successfully: ))",
            user: updateUser
        })

    } catch (err) {
        next(err)
    }
}

exports.updateProdile = async (req, res, next) => {
    try {
        const { firstName, lastName, birthday, nationalCode, email } = req.body;
        
        await updatedProfileValidator.validate(req.body, { ebortEarly: false })

        const user = await userModel.findOne({ _id: req.user._id })
        if (!user) {
            return errorResponse(res, 404, "User not found !!")
        }

        const profileObject = {
            firstName: firstName || user.profile.firstName,
            lastName: lastName || user.profile.lastName,
            birthday: birthday || user.profile.birthday,
            nationalCode: nationalCode || user.profile.nationalCode,
            email: email || user.profile.email
        }

        const updatedProfile = await userModel.findOneAndUpdate({ _id: user._id }, {
            profile: profileObject
        }, { new: true })

        return successResponse(res, 200, {
            message: "User updated successfully :))",
            user: updatedProfile
        })
    } catch (err) {
        next(err)
    }
}