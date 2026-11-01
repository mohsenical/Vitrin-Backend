const express = require("express");

const path = require("path");
require("./src/utils/storyCleanup")
const { setHeaders } = require("./src/middlewares/headers");

const authRouter = require("./src/routes/v1/auth")
const usersRouter = require("./src/routes/v1/user")
const sellersRouter = require("./src/routes/v1/seller")
const locationsRouter = require("./src/routes/v1/location")
const categoriesRouter = require("./src/routes/v1/category")
const productsRouter = require("./src/routes/v1/product")
const notesRouter = require("./src/routes/v1/note");
const commentsRouter = require("./src/routes/v1/comment");
const cartsRouter = require("./src/routes/v1/cart");
const ordersRouter = require("./src/routes/v1/order");
const checkoutsRouter = require("./src/routes/v1/checkout");
const ticketsRouter = require("./src/routes/v1/ticket");
const offsRouter = require("./src/routes/v1/off");
const searchRouter = require("./src/routes/v1/search");
const storyRouter = require("./src/routes/v1/story");
const contactRouter = require("./src/routes/v1/contactUs");
const newLetterRouter = require("./src/routes/v1/newLetter");
const notificationsRouter = require("./src/routes/v1/notification");
const sellerRequestsRouter = require("./src/routes/v1/sellerRequest");

const { redirectToProduct } = require("./src/controllers/v1/shortLink");
const { errorHandler } = require("./src/middlewares/errorHandler");

const app = express();

app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json({ limit: "30mb" }));

app.use(setHeaders);

app.use(express.static(path.join(__dirname, "./../public")));

//* Routers
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", usersRouter)
app.use("/api/v1/seller", sellersRouter)
app.use("/api/v1/locations", locationsRouter)
app.use("/api/v1/categoris", categoriesRouter)
app.use("/api/v1/products", productsRouter)
app.use("/api/v1/notes", notesRouter)
app.use("/api/v1/comments", commentsRouter)
app.use("/api/v1/carts", cartsRouter)
app.use("/api/v1/orders", ordersRouter)
app.use("/api/v1/checkout", checkoutsRouter)
app.use("/api/v1/seller-requests", sellerRequestsRouter)
app.use("/api/v1/tikets", ticketsRouter)
app.use("/api/v1/offs", offsRouter)
app.use("/api/v1/search", searchRouter)
app.use("/api/v1/story", storyRouter)
app.use("/api/v1/contacts", contactRouter)
app.use("/api/v1/newLetter", newLetterRouter)
app.use("/api/v1/notifications", notificationsRouter)
app.get("/p/:shortIdentifier", redirectToProduct)

app.use((req, res) => {
  console.log("This path is not found: ", req.path);

  return res.status(404).json({
    message: "404! Path Not Found. Please double check tha path / method",
  });
});

app.use(errorHandler)

module.exports = app;
