const express = require("express")
const { auth } = require("../../middlewares/auth")
const roleGuard = require("../../middlewares/roleGuard")

const { create, getAllProducts, deleteProduct, getOneProduct, editProduct } = require("../../controllers/v1/product")
const { multerStorage } = require("../../middlewares/upload")

//* Start coding ...
const router = express.Router()

const upload = multerStorage("public/images/products")

router.route("/")
    .post(auth, roleGuard(["ADMIN", "OWNER"]), upload.array("images", 10), create)
    .get(getAllProducts)

router.route("/:productID")
    .get(getOneProduct)
    .delete(auth, roleGuard(["ADMIN", "OWNER"]), deleteProduct)
    .patch(auth, roleGuard(["ADMIN", "OWNER"]), upload.array("images", 10), editProduct)



module.exports = router