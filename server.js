const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const app = require("./app");

const isProductionMode = process.env.NODE_ENV === "production";
if (!isProductionMode) {
  dotenv.config();
}

const connectToDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.log(`Error in mongoose connection: ${err}`);
  }
}

async function startServer() {
  const port = +process.env.PORT || 4000;

  app.listen(port, () => {
    console.log(
      `Server is running in ${isProductionMode ? "production" : "development"
      } mode on port ${port}`
    );
  });
}

async function run() {
  await connectToDB();
  await startServer();
}

run();
