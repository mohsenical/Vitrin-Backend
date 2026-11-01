const express = require("express")

const {
    createTicket,
    getAllTickets,
    removeTicket,
    editTicket,
    userTickets,
    departments,
    createDepartment,
    removeDepatments,
    editDepatments,
    createSubDepatments,
    editSubDepatments,
    removeSubDepatments,
    departmentsSubs,
    setAnswer,
    deleteAnswer,
    editAnswer,
    getAnswer,
} = require("../../controllers/v1/ticket")

const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")


//* Start coding ...
const router = express.Router()

router.route("/")
    .post(auth, createTicket)
    .get(auth, roleGuard(["OWNER", "ADMIN"]), getAllTickets)

router.route("/:id")
    .delete(auth, removeTicket)
    .patch(auth, editTicket)

router.route("/user")
    .get(auth, userTickets)

router.route("/departments")
    .get(departments)
    .post(auth, roleGuard(["OWNER", "ADMIN"]), createDepartment)

router.route("/departments/:id")
    .delete(auth, roleGuard(["OWNER", "ADMIN"]), removeDepatments)
    .put(auth, roleGuard(["OWNER", "ADMIN"]), editDepatments)

router.route("/subDepartments")
    .post(auth, roleGuard(["OWNER", "ADMIN"]), createSubDepatments)

router.route("/subDepartments/:id")
    .put(auth, roleGuard(["OWNER", "ADMIN"]), editSubDepatments)
    .delete(auth, roleGuard(["OWNER", "ADMIN"]), removeSubDepatments)

router.route("/departments/:id/subs").get(departmentsSubs)

router.route("/answer")
    .post(auth, roleGuard(["OWNER", "ADMIN"]), setAnswer)

router.route("/answer/:id")
    .delete(auth, roleGuard(["OWNER", "ADMIN"]), deleteAnswer)
    .put(auth, roleGuard(["OWNER", "ADMIN"]), editAnswer)

router.route("/:id/answer")
    .get(auth, getAnswer)


module.exports = router