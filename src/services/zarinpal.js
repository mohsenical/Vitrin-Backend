
exports.createPayment = async ({ amountInReiyal, description, mobile }) => {
    try {

        const response = await fetch(`${process.env.ZARINPAL_API_BASE_URL}/request.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
                amount: amountInReiyal,
                description,
                callback_url: process.env.ZARINPAL_PAYMENT_CALLBACK_URL,
                metadata: {
                    mobile
                }
            })
        })

        const responseData = await response.json()

        return {
            authority: responseData.data.authority,
            paymentUrl: process.env.ZARINPAL_PAYMENT_BASE_URL + responseData.data.authority,
        }

    } catch (err) {
        throw new Error(err)
    }
}

exports.verifyPayment = async ({ amountInReiyal, authority }) => {
    try {
        const response = await fetch(`${process.env.ZARINPAL_API_BASE_URL}/verify.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                merchant_id: process.env.ZARINPAL_MERCHANT_ID,
                amount: amountInReiyal,
                authority
            })
        })

        const responseData = await response.json();

        return responseData.data

    } catch (err) {
        throw new Error(err)
    }
}