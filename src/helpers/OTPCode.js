const redis = require("./../../redis");
const bcrypt = require("bcrypt")

function getOtoRedisPattern (phone) {
    return `otp:${phone}`;
};

async function getOtpDetails (phone) {
    const otp = await redis.get(getOtoRedisPattern(phone));
    if (!otp) {
        return {
            expire: true,
            remainnigTime: 0
        };
    };

    const remainnigTime = await redis.ttl(getOtoRedisPattern(phone));
    
    const minutes = Math.floor(remainnigTime / 60);
    const seconds = remainnigTime % 60;
    const formatedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return {
        expire: false,
        remainnigTime: formatedTime,
    };
};

async function generateOtp (phone, length = 5, expireTime = 1) {
    const digist = "0123456789";
    let otp = ""

    for (let i = 0; i < length; i++) {
        otp += digist[Math.random() * digist.length]
    };

    //! temporary
    otp = "1111"

    const hashesOtp = await bcrypt.hash(otp, 12)

    await redis.set(getOtoRedisPattern(phone), hashesOtp, "EX", expireTime * 60);

    return otp
}

module.exports = { getOtoRedisPattern, getOtpDetails, generateOtp }