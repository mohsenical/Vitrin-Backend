const { isValidObjectId } = require("mongoose");

const productModel = require("../../models/Product")
const noteModel = require("../../models/Note")

const { errorResponse, successResponse } = require("../../helpers/responses");
const { createPaginationData } = require("../../utils/PaginationData");
const { createNoteValidator, editNoteValidator } = require("../../validators/note");

exports.addNote = async (req, res, next) => {
    try {
        const { productID, content } = req.body;
        const user = req.user;

        await createNoteValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(productID)) {
            return errorResponse(res, 400, "Product ID is not valid !!")
        }

        const existingProduct = await productModel.findOne({
            _id: productID,
        })
        if (!existingProduct) {
            return errorResponse(res, 404, "Product not found !!")
        };

        const existingNote = await noteModel.findOne({
            user: user._id,
            product: productID
        });
        if (existingNote) {
            return errorResponse(res, 400, "Auother note already exist for this product !!")
        }

        const note = await noteModel.create({
            user: user._id,
            product: productID,
            content
        })

        return successResponse(res, 201, {
            message: "Note created successfully :))"
        })
    } catch (err) {
        next(err)
    }
}

exports.getNotes = async (req, res, next) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10 } = req.query;

        const notes = await noteModel.find({ user: user._id })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("product")
            .lean()

        let notedProducts = []
        for (const note of notes) {
            if (note.product) {
                const product = {
                    ...note.product,
                    note: {
                        _id: note._id,
                        content: note.content,
                        createdAt: note.createdAt
                    }
                }

                notedProducts.push(product)
            } else {
                await noteModel.findOneAndDelete({ _id: note._id })
            }
        }

        const userTotalNotes = await noteModel.countDocuments()

        return successResponse(res, 200, {
            products: notedProducts,
            pagenation: createPaginationData(page, limit, userTotalNotes, "Notes")
        })
    } catch (err) {
        next(err)
    }
}


exports.getNote = async (req, res, next) => {
    try {
        const { noteID } = req.params;
        const user = req.user;

        if (!isValidObjectId(noteID)) {
            return errorResponse(res, 400, "Note ID is not valid !!")
        }

        const note = await noteModel.findOne({ _id: noteID, user: user._id }).populate("user").populate("product").lean()
        if (!note) {
            return errorResponse(res, 404, "Note not found or you hav not access to it !!")
        }

        if (!note.product) {
            await noteModel.findOneAndDelete({ _id: noteID })
            return errorResponse(res, 404, "This product has been remove !!")

        }

        const product = {
            ...note.product,
            note: {
                _id: note._id,
                content: note.content,
                createdAt: note.createdAt
            }
        }

        return successResponse(res, 200, {
            product
        })
    } catch (err) {
        next(err)
    }
}

exports.editNote = async (req, res, next) => {
    try {
        const { noteID } = req.params;
        const user = req.user
        const { content } = req.body;

        await editNoteValidator.validate(req.body, { ebortEarly: false })

        if (!isValidObjectId(noteID)) {
            return errorResponse(res, 400, "Note ID is not Valid !!")
        }

        const editedNote = await noteModel.findOneAndUpdate(
            { _id: noteID, user: user._id },
            { content },
            { new: true }
        );

        if (!editedNote) {
            return errorResponse(res, 404, "Note not found or you hav not access to it !!")
        }

        return successResponse(res, 200, {
            message: "Not updateed successfully :))",
            note: editedNote
        })

    } catch (err) {
        next(err)
    }
}

exports.removeNote = async (req, res, next) => {
    try {
        const { noteID } = req.params;
        const user = req.user;

        if (!isValidObjectId(noteID)) {
            return errorResponse(res, 400, "Note ID is not valid !!")
        }

        const existingNote = await noteModel.findOne({ _id: noteID })
        if (!existingNote || existingNote.user.toString() !== user._id.toString()) {
            return errorResponse(res, 404, "Note not found or not has access to it !!")

        }

        const deletedNote = await noteModel.findOneAndDelete({ _id: noteID })

        return successResponse(res, 200, {
            message: "Not deleted successfully :))",
            note: deletedNote,
        })
    } catch (err) {
        next(err)
    }
}