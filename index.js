const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const userRouter = require("./api/user");
const postRouter = require("./api/post");

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  })
);
app.use("/users", userRouter);
app.use("/posts", postRouter);

app.use((err, req, res, next) => {
  const errMessage = {
    name: err.name,
    message: err.message,
  };
  res.json(errMessage);
});

module.exports = app;
