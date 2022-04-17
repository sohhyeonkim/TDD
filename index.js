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
  const errMessage = { name: err.name, message: err.stack };
  if (err.name === "TokenExpiredError") {
    errMessage.message = "재로그인 필요";
  }
  if (err.name === "JsonWebTokenError") {
    errMessage.message = "로그인 필요";
    next("/users/login");
  }
  if (err.name === "MulterError") {
    errMessage.message = "이미지 파일은 4MB이하로만 가능";
  }
  if (err.name === "MissingRequiredParameter") {
    errMessage.message = "잘못된 s3 이미지 버킷 키";
  }
  if (err.name === "TypeError") {
    errMessage.message = "게시물 patch 요청에서 바디와 이미지 파일이 모두 없음";
  }
  //console.log(errMessage);
  return res.json(errMessage);
});

module.exports = app;
