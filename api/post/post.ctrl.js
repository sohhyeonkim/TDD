const models = require("../../models/index");
const isAvailableUserId = require("../common_utils/getUserById");

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
      console.log("createPost working");
      const isAvailableReqId = await isAvailableUserId(req.id);
      if (!isAvailableReqId) {
        return res.status(403).end();
      }
      await models.Post.create({
        content,
        img: imgUrl,
        UserId: req.id,
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
  getAllPosts,
  getPostBypostId,
};
