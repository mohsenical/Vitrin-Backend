const express = require("express");
const { auth } = require("../../middlewares/auth");

const { addNote, getNotes, getNote, editNote, removeNote } = require("../../controllers/v1/note");

//* Start coding ...
const router = express.Router()

router.route("/")
    .get(auth, getNotes)
    .post(auth, addNote)

router.route("/:noteID")
    .get(auth, getNote)
    .put(auth, editNote)
    .delete(auth, removeNote)

module.exports = router