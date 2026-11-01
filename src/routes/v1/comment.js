const express = require("express")

const {
    getComments,
    createComment,
    getAllComment,
    updateComment,
    deleteComment,
    acceptComment,
    rejectComment,
    addReply,
    updateReply,
    deleteReply,
    acceptReplyComment,
    rejectReplyComment
} = require("../../controllers/v1/comment")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

//* Start coding ...
const router = express.Router()

router.route("/")
    .get(getComments)
    .post(auth, createComment);

router.route("/all")
    .get(auth, roleGuard(["OWNER", "ADMIN"]), getAllComment)

router.route("/:commentId")
    .patch(auth, updateComment)
    .delete(auth, roleGuard(["ADMIN", "OWNER"]), deleteComment);

router.route("/:commentId/accept")
    .patch(auth, roleGuard(["OWNER", "ADMIN"]), acceptComment)

router.route("/:commentId/reject")
    .patch(auth, roleGuard(["OWNER", "ADMIN"]), rejectComment)

router.route("/:commentId/reply")
    .post(auth, addReply)

router.route("/:commentId/reply/:replyId")
    .patch(auth, roleGuard(["ADMIN", "SELLER", "OWNER"]), updateReply)
    .delete(auth, deleteReply)

router.route("/:commentId/reply/:replyId/accept")
    .patch(auth, roleGuard(["OWNER", "ADMIN"]), acceptReplyComment)

router.route("/:commentId/reply/:replyId/reject")
    .patch(auth, roleGuard(["OWNER", "ADMIN"]), rejectReplyComment)

module.exports = router