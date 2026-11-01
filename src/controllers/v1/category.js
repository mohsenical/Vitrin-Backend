const path = require("path")
const fs = require("fs")

const { isValidObjectId } = require("mongoose");

const categoryModel = require("../../models/Category")
const subCategoryModel = require("../../models/SubCategory")

const { errorResponse, successResponse } = require("../../helpers/responses");
const { categoryValidator, categoryEditValidator } = require("../../validators/category");

const supportedFormate = [
    "image/jpeg",
    "image/png",
    "image/svg",
    "image/webp",
    "image/gif",
    "image/svg+xml",
]

exports.fetchAllCategories = async (req, res, next) => {
    try {
        const fetchSubCategoriesRecursively = async (parentId = null) => {
            const subCategories = await subCategoryModel.find({ parent: parentId }).lean();
            const parentSubCategories = await categoryModel.find({ parent: parentId }).lean();

            const fetchParentSubCategories = []

            for (const category of parentSubCategories) {

                category.subCategories = await fetchSubCategoriesRecursively(category._id)

                fetchParentSubCategories.push(category)
            };

            return [...fetchParentSubCategories, ...subCategories]
        }

        const categories = await fetchSubCategoriesRecursively();

        return successResponse(res, 200, { categories })
    } catch (err) {
        next(err)
    }
}

exports.createCategory = async (req, res, next) => {
    try {
        let { title, slug, parent, description, filters } = req.body;
        filters = JSON.parse(filters)

        await categoryValidator.validate({ title, slug, parent, description, filters }, { ebortEarly: false })

        let icon = null;
        if (req.file) {
            const { filename, mimetype } = req.file;

            if (!supportedFormate.includes(mimetype)) {
                return errorResponse(res, 400, "unSupported image format !!")
            }

            icon = {
                fileName: filename,
                path: `/images/category-icons/${filename}`
            }
        }

        const newCategory = await categoryModel.create({
            title,
            slug,
            parent,
            description,
            icon,
            filters
        })

        return successResponse(res, 201, {
            category: newCategory,
        })

    } catch (err) {
        next(err)
    }
}

exports.editCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        let { title, slug, parent, description, filters } = req.body;
        filters = JSON.parse(filters)

        await categoryEditValidator.validate({ title, slug, parent, description, filters }, { ebortEarly: false });

        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 403, "Category ID is not valid !!");
        }

        const existingCategory = await categoryModel.findOne({ _id: categoryId });
        if (!existingCategory) {
            return errorResponse(res, 404, "Category note found !!")
        }

        let icon = null;
        if (req.file) {
            const { filename, mimetype } = req.file;

            if (!supportedFormate.includes(mimetype)) {
                return errorResponse(res, 400, "unSupported image format !!");
            }

            icon = {
                fileName: filename,
                path: `/images/category-icons/${filename}`,
            }
        }

        const editedCategory = await categoryModel.findOneAndUpdate({ _id: categoryId }, {
            title,
            slug,
            parent,
            description,
            icon,
            filters
        }, { new: true });

        const filePath = path.join(__dirname, "../../../public/images/category-icons", existingCategory.icon.fileName)
        fs.unlink(filePath, (err) => {
            if (err) {
                return errorResponse(res, 404, "Iamge not found, for deleted to Update icon !!");
            }
        })

        return successResponse(res, 200, {
            message: "category edited successfully :)",
            category: editedCategory
        })


    } catch (err) {
        next(err)
    }
}

exports.deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;

        if (!isValidObjectId(categoryId)) {
            return errorResponse(res, 403, "Category ID is not valid !!")
        }

        const deletedCategory = await categoryModel.findOneAndDelete({ _id: categoryId })
        if (!deletedCategory) {
            return errorResponse(res, 404, "Category not found !!")
        }

        const pathFile = path.join(__dirname, "../../../public", deletedCategory.icon.path)

        fs.unlinkSync(pathFile, (err) => {
            if (err) {
                throw new error(err)
            }
        })

        return successResponse(res, 200, {
            message: "Category deleted successfully :)",
            category: deletedCategory
        })
    } catch (err) {
        next(err)
    }
}