const express = require("express");
const router = express.Router();
const ctrl = require("./post.ctrl");
const upload = require("../../config/multer");

router.post("/", upload.single("image"), ctrl.uploadSingleImg);

module.exports = router;
