const express = require("express");
const router = express.Router();
const ctrl = require("./post.ctrl");
const upload = require("../../config/multer");

router.post("/", upload.single("image"), ctrl.createPost);
router.delete("/:postId", ctrl.deletePostHandler);
router.get("/", ctrl.getAllPosts);
router.get("/:postId", ctrl.getPostBypostId);
module.exports = router;
