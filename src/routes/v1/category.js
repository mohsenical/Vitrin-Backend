const express = require("express")

const roleGuard = require("../../middlewares/roleGuard")
const { auth } = require("../../middlewares/auth")
const { multerStorage } = require("../../middlewares/upload")

const { createCategory, editCategory, deleteCategory, fetchAllCategories } = require("../../controllers/v1/category")
const { createSubCategory, getAllSubCategory, getSubCategory, deleteSubCategory } = require("../../controllers/v1/subCategory")

//* Start coding ...
const router = express.Router()

const upload = multerStorage("public/images/category-icons/")

router.route("/")
    .get(fetchAllCategories)
    .post(auth, roleGuard(["ADMIN", "OWNER"]), upload.single("icon"), createCategory)

router
    .route("/:categoryId")
    .put(auth, roleGuard(["ADMIN", "OWNER"]), upload.single("icon"), editCategory)
    .delete(auth, roleGuard(["ADMIN", "OWNER"]), deleteCategory)

router.route("/sub")
    .post(auth, roleGuard(["ADMIN", "OWNER"]), createSubCategory)
    .get(getAllSubCategory)

router.route("/sub/:categoryId")
    .get(getSubCategory)
    .delete(auth, roleGuard(["ADMIN", "OWNER"]), deleteSubCategory)


module.exports = router