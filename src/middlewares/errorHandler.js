const { successResponse, errorResponse } = require("../helpers/responses");

exports.errorHandler = (err, req, res, next) => {
    if (err.name === "ValidationError") {
        const errors = []

        err.inner.forEach(error => {
            errors.push({
                field: error.path,
                message: error.message
            })
        });

        console.log({
            success: false,
            error: "Validation Error",
            data: errors
        });
        return errorResponse(res, 400, "Validation Error: ", errors)
    }

    let message = err.message || "Internal Server Error"
    let status = err.status || 500

    console.log({
        success: false,
        error: message,
    });

    return errorResponse(res, status, message)
}

//? TypeError