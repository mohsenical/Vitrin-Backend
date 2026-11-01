const { isValidObjectId } = require("mongoose");

const subCategory = require("../../models/SubCategory")
const parentCategory = require("../../models/Category");

const { subCategoryValidator } = require("../../validators/category");
const { errorResponse, successResponse } = require("../../helpers/responses");


exports.createSubCategory = async (req, res, next) => {
    try {
        let { title, slug, parent, description, filters } = req.body;

        await subCategoryValidator.validate({ title, slug, parent, description, filters }, { ebortEarly: false });

        const parentCheck = await parentCategory.findOne({ _id: parent })
        if (!parent) {
            return errorResponse(res, 404, "Parent ID is not correct !!")
        }

        const category = await subCategory.create({
            title,
            slug,
            parent,
            description,
            filters
        })

        return successResponse(res, 201, {
            category,
        })

    } catch (err) {
        next(err)
    }
}

exports.getAllSubCategory = async (req, res, next) => {
    try {
        const categoris = await subCategory.find({});

        return successResponse(res, 200, {
            categoris
        })
    } catch (err) {
        next(err)
    }
}

exports.getSubCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 403, "Category ID is not valid !!");
        };

        const category = await subCategory.findOne({ _id: categoryId })
        if (!category) {
            return errorResponse(res, 404, "SubCategory not found !!");
        }

        return successResponse(res, 200, {
            category
        })

    } catch (err) {
        next(err)
    }
}

exports.deleteSubCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 403, "Category ID is not valid !!");
        };

        const deletedCategory = await subCategory.findOneAndDelete({ _id: categoryId })
        if (!deletedCategory) {
            return errorResponse(res, 404, "Category not found !!");
        }

        return successResponse(res, 200, {
            message: "SubCategory deleted successfully :))",
            category: deletedCategory
        })
    } catch (err) {
        next(err)
    }
}