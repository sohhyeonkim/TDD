const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const models = require("../../models/index");
const createHashedPassword = require("./utils/createHashedPassword.js");
const createAccessToken = require("./utils/createAccessToken");
const decodeToken = require("../user/utils/decodeAccessToken");

const authHandler = async (req, res) => {
  const { accessToken } = req.cookies;
  console.log("[accessToken]: ", accessToken);
  if (!accessToken) {
    return res.status(400).json({
      message: "no accessToken",
    });
  }
  const decoded = await decodeToken(accessToken);
  console.log("[decoded token]: ", decoded);
  return res.send("authHandler testing");
};

const loginhandler = async (req, res) => {
  try {
    if (!req.body.userId && !req.body.password) {
      return res.status(400).send({
        message: "userId or password not provided",
      });
    }
    const existingUser = await getUserByUserId(req.body.userId);
    if (!existingUser) {
      return res.status(400).send({
        message: "user not found",
      });
    }

    const isSame = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );

    if (isSame) {
      delete existingUser.password;

      const accessToken = createAccessToken(existingUser.dataValues);
      res
        .cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60,
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .status(200)
        .json({
          isLogin: true,
        })
        .end();
    } else {
      return res.status(400).json({
        isLogin: false,
        message: "wrong password",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const getUserByUserId = async (userId) => {
  try {
    const existingUser = await models.User.findOne({
      where: {
        userId,
      },
    });
    return existingUser;
  } catch (err) {
    console.log(err);
  }
};

const getUserById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).end();
  }
  models.User.findOne({
    where: {
      id,
    },
  }).then((user) => {
    if (!user) {
      return res.status(404).end();
    }
    return res.json(user);
  });
};

const deleteById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) {
    return res.status(400).end();
  }
  models.User.destroy({
    where: {
      id,
    },
  }).then((data) => {
    if (data) {
      return res.status(204).end();
    }
    return res.status(404).end();
  });
};

const createUser = async (req, res) => {
  const { userId, password, nickname } = req.body;
  if (!userId || !password || !nickname) {
    return res.status(400).json({
      isCreated: false,
    });
  }
  const hash = await createHashedPassword(password);

  models.User.findOrCreate({
    where: {
      [Op.or]: [{ userId }, { nickname }],
    },
    defaults: {
      userId,
      password: hash,
      nickname,
    },
  }).then(([user, created]) => {
    if (created) {
      return res.status(201).json({
        isCreated: true,
      });
    }
    return res.status(409).json({
      isCreated: false,
    });
  });
};

const validationCheck = (req, res) => {
  const userId = req.body.userId;
  const nickname = req.body.nickname;
  if (userId) {
    models.User.findOne({
      where: {
        userId,
      },
    }).then((user) => {
      if (user) {
        return res.status(409).end();
      }
      return res.status(204).end();
    });
  } else if (nickname) {
    models.User.findOne({
      where: {
        nickname,
      },
    }).then((user) => {
      if (user) {
        return res.status(409).end();
      }
      return res.status(204).end();
    });
  } else {
    return res.status(400).end();
  }
};

const updateUserById = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { userId, password, nickname } = req.body;
  if (Number.isNaN(id)) {
    return res.status(400).end();
  }
  if (!userId && !password && !nickname) {
    return res.status(400).end();
  }

  models.User.findOne({
    where: {
      id,
    },
  }).then((user) => {
    if (!user) {
      return res.status(404).end();
    }
    if (userId) {
      models.User.update(
        { userId },
        {
          where: {
            id,
          },
        }
      );
    }

    if (password) {
      models.User.update(
        { password },
        {
          where: {
            id,
          },
        }
      );
    }

    if (nickname) {
      models.User.update(
        { nickname },
        {
          where: {
            id,
          },
        }
      );
    }

    return res.status(204).end();
  });
};

module.exports = {
  loginhandler,
  getUserByUserId,
  getUserById,
  deleteById,
  createUser,
  validationCheck,
  updateUserById,
  authHandler,
};
