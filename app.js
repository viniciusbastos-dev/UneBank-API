require("express-async-errors");
const mongoose = require("mongoose");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const config = require("./utils/config");
const logger = require("./utils/logger");
const userRouter = require("./controller/user");
const {
  unknownEndpoint,
  errorHandler,
  tokenExtractor,
  userExtractor,
} = require("./utils/middleware");
const accountRouter = require("./controller/account");

const app = express();

mongoose.set("strictQuery", false);

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("Error connecting to MongoDB", error.message);
  });

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(tokenExtractor);

app.use("/api/user", userRouter);
app.use("/api/account", userExtractor, accountRouter);

app.use(unknownEndpoint);
app.use(errorHandler);

module.exports = app;
