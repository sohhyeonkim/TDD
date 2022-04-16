const models = require("../../models/index");
const isAvailableUserId = require("../common_utils/getUserById");
const s3 = require("../../config/s3");
require("dotenv").config();

const createPost = async (req, res, next) => {
  const content = req.body.content;
  const imgUrl = req.file.location || null;

  try {
    if (!content) {
      return res.status(400).json({
        isUploaded: false,
        message: "content required",
      });
    } else {
      const isAvailableReqId = await isAvailableUserId(
        parseInt(req.headers.id, 10)
      );
      if (!isAvailableReqId) {
        return res.status(403).end();
      }
      await models.Post.create({
        content,
        img: imgUrl,
        UserId: parseInt(req.headers.id, 10),
      });

      return res.json({
        isUploaded: true,
        imgUrl,
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const deleteImgFromS3 = async (req, res, next) => {
  const fileKey = req.body.fileKey.split(".com/")[1];
  const params = {
    Bucket:
      process.env.NODE_ENV !== "test"
        ? process.env.S3_BUCKETNAME
        : process.env.S3_TESTBUCKETNAME,
    Key: fileKey,
  };
  s3.deleteObject(params, (err, data) => {
    if (err) {
      next(err);
    }
  });
};

const deletePostByPostId = async (postId, res, next) => {
  try {
    const isDeleted = await models.Post.destroy({
      where: {
        id: postId,
      },
    });
    if (isDeleted) {
      return res.status(204).end();
    } else {
      return res.status(400).end();
    }
  } catch (err) {
    next(err);
  }
};

const deletePostHandler = async (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    const id = parseInt(req.headers.id, 10);

    if (Number.isNaN(postId)) {
      return res.status(400).end();
    } else {
      const isAvailableReqId = await isAvailableUserId(id);
      if (!isAvailableReqId) {
        return res.status(403).end();
      }
      await deleteImgFromS3(req, res, next);
      await deletePostByPostId(postId, res, next);
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await models.Post.findAll({
      order: [["createdAt", "DESC"]],
    });
    return res.json({
      posts,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getPostBypostId = async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  if (Number.isNaN(postId)) {
    return res.status(400).end();
  }
  try {
    const post = await models.Post.findOne({
      where: {
        id: postId,
      },
    });
    return res.json({
      post,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = {
  createPost,
  deletePostHandler,
  deleteImgFromS3,
  deletePostByPostId,
  getAllPosts,
  getPostBypostId,
};
