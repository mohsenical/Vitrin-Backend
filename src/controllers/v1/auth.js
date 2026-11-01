const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const { sendSms } = require("../../services/otp");
const Ban = require("../../models/Ban")
const User = require("../../models/User")

const { getOtpDetails, generateOtp, getOtoRedisPattern } = require("../../helpers/OTPCode");
const { errorResponse, successResponse } = require("../../helpers/responses");
const { otpVerifyValidator, sentOtpValidator } = require("../../validators/auth");
const redis = require("../../../redis");

exports.send = async (req, res, next) => {
    try {
        const { phone } = req.body;

        const isBanned = await Ban.findOne({ phone })
        if (isBanned) {
            errorResponse(res, 403, "This phone number has been Banned !!");
        };

        await sentOtpValidator.validate(req.body, { ebortEarly: false })

        const { expire, remainnigTime } = await getOtpDetails(phone);
        if (!expire) {
            return errorResponse(res, 200, {
                message: `OTP already send, please try agine after ${remainnigTime}`
            })
        }

        const otp = await generateOtp(phone)

        await sendSms(phone, otp)

        return successResponse(res, 200, {
            message: "otp send successfully :))"
        })
    } catch (err) {
        next(err)
    }
}

exports.verify = async (req, res, next) => {
    try {

        const { phone, otp, isSeller } = req.body;

        await otpVerifyValidator.validate(req.body, { ebortEarly: false });

        const saveOtp = await redis.get(getOtoRedisPattern(phone));
        if (!saveOtp) {
            return errorResponse(res, 400, "Wrong or expired OTP !!")
        }

        const otpIsCorrect = await bcrypt.compare(otp, saveOtp);
        if (!otpIsCorrect) {
            return errorResponse(res, 400, "Wrong or expired OTP !!")
        }

        const existingUser = await User.findOne({ phone });

        if (existingUser) {
            const accessToken = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET_ACCESS_TOKEN, {
                expiresIn: process.env.JWT_ACCESS_EXPIER_IN_MINUTE + "m" //minute
            });

            const refreshToken = jwt.sign({ userId: existingUser._id }, process.env.JWT_SECRET_REFRESH_TOKEN, {
                expiresIn: process.env.JWT_REFRESH_EXPIER_IN_DAY + "d" //minute
            });

            // res.cookie("access_token", accessToken, {
            //     httpOnly: true,
            //     maxAge: 15 * 60 * 60 * 1000,
            //     path: "/"
            // })

            // res.cookie("refresh_token", refreshToken, {
            //     httpOnly: true,
            //     maxAge: 30 * 24 * 60 * 60 *  1000,
            //     path: "/"
            // })

            const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

            await redis.set(`refreshToken:${existingUser.phone}`, hashedRefreshToken, "EX", 1000 * 60 * 60 * 24 * 30)

            successResponse(res, 200, {
                user: existingUser,
                accessToken,
                refreshToken
            })
        }


        //*register

        const isFirstUser = (await User.countDocuments()) === 0

        const user = await User.create({
            phone,
            username: phone,
            roles: isFirstUser ? ["OWNER"] : isSeller ? ["USER", "SELLER"] : ["USER"],
        });

        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_ACCESS_TOKEN, {
            expiresIn: process.env.JWT_ACCESS_EXPIER_IN_MINUTE + "m" //minute
        });

        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_REFRESH_TOKEN, {
            expiresIn: process.env.JWT_REFRESH_EXPIER_IN_DAY + "d" //minute
        });

        const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);

        await redis.set(`refreshToken:${user.phone}`, hashedRefreshToken, "EX", 1000 * 60 * 60 * 24 * 30)


        successResponse(res, 201, {
            message: "User create successfully :))",
            user,
            accessToken,
            refreshToken,
        })

    } catch (err) {
        next(err)
    }
}

exports.getMe = async (req, res, next) => {
    try {
        const user = req.user

        return successResponse(res, 200, {
            user,
        })
    } catch (err) {
        next(err)
    }
}