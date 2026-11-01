const { errorResponse, successResponse } = require("../../helpers/responses");
const productModel = require("../../models/Product");
const { createPaginationData } = require("../../utils/PaginationData");

exports.search = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 10 } = req.query;

        if (!q || !q.trim()) {
            return errorResponse(res, 403, "Keyword is not valid !!")
        }

        const product = await productModel.aggregate([
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory"
                }
            },
            {
                $unwind: {
                    path: "$subCategory",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $match: {
                    $or: [
                        {
                            name: {
                                $regex: q,
                                $options: "i"
                            }
                        },
                        {
                            description: {
                                $regex: q,
                                $options: "i"
                            }
                        },
                        {
                            "subCategory.title": {
                                $regex: q,
                                $options: "i"
                            }
                        },
                        {

                            $expr: {
                                $anyElementTrue: [
                                    {
                                        $map: {
                                            input: { $objectToArray: "$filterValues" },
                                            as: "filter",
                                            in: {
                                                $regexMatch: {
                                                    input: { $toString: "$$filter.v" },
                                                    regex: q,
                                                    options: "i"
                                                }
                                            }
                                        },
                                    }
                                ]
                            }
                        },
                        {
                            $expr: {
                                $anyElementTrue: [
                                    {
                                        $map: {
                                            input: { $objectToArray: "$customFilters" },
                                            as: "filter",
                                            in: {
                                                $regexMatch: {
                                                    input: { $toString: "$$filter.v" },
                                                    regex: q,
                                                    options: "i"
                                                }
                                            }
                                        },
                                    }
                                ]
                            }
                        },
                    ],
                }
            },
            { $skip: (page - 1) * limit },
            { $limit: +limit }
        ])

        return successResponse(res, 200, {
            product,
            pagination: createPaginationData(page, limit, product.length, "Search")
        })
    } catch (err) {
        next(err)
    }
} 