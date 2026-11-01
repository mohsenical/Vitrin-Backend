const { isValidObjectId, default: mongoose } = require("mongoose");
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");

const productModel = require("../../models/Product");

const { errorResponse, successResponse } = require("../../helpers/responses");
const { createProductValidator, updateProductValidator } = require("../../validators/product");
const { createPaginationData } = require("../../utils/PaginationData");

const supportedFormate = [
    "image/jpeg",
    "image/png",
    "image/svg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
]

exports.create = async (req, res, next) => {
    try {
        let { name, slug, description, subCategory, sellers, filterValues, customFilters } = req.body;

        if (sellers) sellers = JSON.parse(sellers);
        if (filterValues) filterValues = JSON.parse(filterValues);
        if (customFilters) customFilters = JSON.parse(customFilters);

        if (!isValidObjectId(subCategory)) {
            return errorResponse(res, 400, "Subcategory ID is not valid !!")
        }

        const validatedData = await createProductValidator.validate(
            {
                name,
                slug,
                description,
                subCategory,
                sellers,
                filterValues,
                customFilters
            },
            { ebortEarly: false }
        )

        let images = [];
        if (req.files) {
            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i];

                if (!supportedFormate.includes(file.mimetype)) {
                    return errorResponse(res, 400, "unSupported image format !!")
                };

                images.push({
                    filename: file.filename,
                    path: `/images/products/${file.filename}`
                });
            }
        }

        let shortIdentifier = ""
        while (!shortIdentifier) {
            shortIdentifier = nanoid(6)

            const product = await productModel.findOne({ shortIdentifier })

            if (product) shortIdentifier = ""
        };

        const newProduct = await productModel.create({
            name: validatedData.name,
            slug: validatedData.slug,
            description: validatedData.description,
            subCategory: validatedData.subCategory,
            images,
            sellers: validatedData.sellers.map((seller) => ({
                seller: seller.id,
                price: seller.price,
                stock: seller.stock
            })),
            filterValues: validatedData.filterValues || {},
            customFilters: validatedData.customFilters || {},
            shortIdentifier
        })

        return successResponse(res, 201, {
            message: "Product created successfully :))",
            product: newProduct
        })

    } catch (err) {
        next(err)
    }
}

exports.getAllProducts = async (req, res, next) => {
    try {
        const { name, subCategory, minPrice, maxPrice, sellerId, filterValues, page = 1, limit = 10 } = req.query;

        const filters = {
            "sellers.stock": { $gt: 0 },
        };

        if (name) {
            filters.name = { $regex: name, $options: "i" }
        }

        if (subCategory) {
            filters.subCategory = mongoose.Types.ObjectId.createFromHexString(subCategory)
        }

        if (minPrice) {
            filters["sellers.price"] = { $gte: +minPrice }
        }

        if (maxPrice) {
            filters["sellers.price"] = { $lte: +maxPrice }
        }

        if (sellerId) {
            filters["sellers.seller"] = mongoose.Types.ObjectId.createFromHexString(sellerId)
        }

        if (filterValues) {
            const paresdFilterValues = JSON.parse(filterValues)

            Object.keys(filterValues).forEach(key => {
                filters[`filterValues.${key}`] = paresdFilterValues[key];
            })
        }

        const products = await productModel.aggregate([
            { $match: filters },
            {
                $lookup: {
                    from: "comments",
                    localField: "_id",
                    foreignField: "product",
                    as: "comments"
                }
            },
            {
                $addFields: {
                    averageRating: {
                        $cond: {
                            if: { $gt: [{ $size: "$comments" }, 0] },
                            then: { $avg: `$comments.rating` },
                            else: 0
                        }
                    }
                }
            },
            {
                $skip: (page - 1) * limit
            },
            {
                $limit: +limit
            },
        ])

        const totalProduct = await productModel.countDocuments()

        return successResponse(res, 200, {
            products,
            pagination: createPaginationData(page, limit, totalProduct, "products")
        })

    } catch (err) {
        next(err)
    }
}

exports.getOneProduct = async (req, res, next) => {
    try {
        const { productID } = req.params;
        if (!isValidObjectId(productID)) {
            return errorResponse(res, 400, "Subcategory ID is not valid !!");
        };

        const product = await productModel.findOne({ _id: productID }).populate("subCategory").populate("sellers.seller");
        if (!product) {
            return errorResponse(res, 404, "Product not found !!");
        };

        return successResponse(res, 200, {
            product
        })
    } catch (err) {
        next(err)
    }
}

exports.deleteProduct = async (req, res, next) => {
    try {
        const { productID } = req.params;

        if (!isValidObjectId(productID)) {
            return errorResponse(res, 400, "Product ID is not valid !!");
        };

        const removedProduct = await productModel.findOneAndDelete({ _id: productID });

        removedProduct?.images?.map((image) => {
            const imagePath = path.join(__dirname, `../../../public/images/products/${image.filename}`)
            fs.unlink(imagePath, (err) => {
                if (err) {
                    next(err)
                }
            })
        })

        if (!removedProduct) {
            return errorResponse(res, 404, "Product not found !!");
        };

        return successResponse(res, 200, {
            message: "Product deleted successfully :))",
            product: removedProduct
        });
    } catch (err) {
        next(err)
    }
}

exports.editProduct = async (req, res, next) => {
    try {
        const { productID } = req.params;
        const user = req.user;
        let { name, slug, description, subCategory, filterValues, customFilters } = req.body;

        if (filterValues) filterValues = JSON.parse(filterValues);
        if (customFilters) customFilters = JSON.parse(customFilters);

        if (!isValidObjectId(productID)) {
            return errorResponse(res, 400, "Product ID is not valid !!")
        }

        if (!isValidObjectId(subCategory)) {
            return errorResponse(res, 400, "Product ID is not valid !!")
        }

        await updateProductValidator.validate({
            name,
            slug,
            description,
            subCategory,
            customFilters,
            filterValues,
        }, { ebortEarly: false });

        const existingProduct = await productModel.findById(productID);
        if (!existingProduct) {
            return errorResponse(res, 404, "Product ot found !!")
        }

        images: [];

        if (req.files) {

            existingProduct.images.map(image => {
                filePath = `../../../public/images/products/${image.filename}`
                fs.unlink(path.join(__dirname, filePath), (err) => {
                    if (err) {
                        next(err)
                    }
                })
            });

            for (let i = 0; i < req.files.length; i++) {
                const file = req.files[i]

                if (!supportedFormate.includes(file.mimetype)) {
                    return errorResponse(res, 400, "unSupported image format !!")
                }

                images.push({
                    filename: file.filename,
                    path: `images/products/${file.filename}`
                })
            }

        }

        const edietdProduct = await productModel.findOneAndUpdate(
            { _id: productID },
            {
                name,
                slug,
                description,
                subCategory,
                images: images.length ? images : null,
                filterValues,
                customFilters
            },
            { new: true }
        );

        return successResponse(res, 200, {
            message: "Product updated successfully :))",
            product: edietdProduct
        });


    } catch (err) {
        next(err)
    }
}