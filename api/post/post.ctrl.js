const models = require("../../models/index");

const createPost = async (req, res) => {
  const content = req.body.text ? req.body.text : "";
  const imgUrl = req.file.location ? req.file.location : "";
  if (!content) {
    return res.status(400).json({
      isUploaded: false,
      message: "content required",
    });
  } else {
    await models.Post.create({
      content,
      img: imgUrl,
    });
    return res.json({
      isUploaded: true,
      imgUrl,
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const posts = await models.Post.findAll({
      order: ["createdAt", "DESC"],
    });
    return res.json({
      posts,
    });
  } catch (err) {
    console.log(err);
  }
};

const getPostBypostId = async (req, res) => {
  const postId = parseInt(req.params.postId, 10);
  if(Number.isNaN(postId) {
    return res.status(400).end();
  }
  try{
    const post = await models.Post.findOne({
      where: {
        id: postId,
      },
    });
    return res.json({
      post,
    });
  } catch(err) {
    console.log(err);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostBypostId,
};
