const express = require("express");
const morgan = require("morgan");
const app = express();
const userRouter = require("./api/user");

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users", userRouter);

module.exports = app;
