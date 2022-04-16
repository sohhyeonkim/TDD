const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const loginHandler = require("./api/user/loginHandler");
const userRouter = require("./api/user");
const postRouter = require("./api/post");
const decodeToken = require("./api/user/utils/decodeAccessToken");
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
app.post("/users/login", loginHandler);
if (process.env.NODE_ENV !== "test") {
  app.use(async (req, res, next) => {
    const { accessToken } = req.cookies;
    console.log("[accessToken]: ", accessToken);

    try {
      const decoded = await decodeToken(accessToken);
      req.headers.id = decoded.id;
      console.log("[req.headers]: ", req.headers);
    } catch (err) {
      console.log(err);
      next(err);
    }
    return next();
  });
}

app.use("/users", userRouter);
app.use("/posts", postRouter);

app.use((err, req, res, next) => {
  const errMessage = {};
  if (err.name === "TokenExpiredError") {
    errMessage.name = err.name;
    errMessage.message = "재로그인 필요";
  }
  if (err.name === "JsonWebTokenError") {
    errMessage.name = err.name;
    errMessage.message = "로그인 필요";
    next("/users/login");
  }
  if (err.name === "MulterError") {
    errMessage.name = err.name;
    errMessage.message = "이미지 파일은 5MB이하로만 가능";
  }
  return res.json(errMessage);
});

module.exports = app;
