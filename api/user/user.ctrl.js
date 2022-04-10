const models = require("../../models");
const createHashedPassword = require("./utils/createHashedPassword.js");
const comparePasswords = require("./utils/comparePasswords");
const createAccessToken = require("./utils/createAccessToken");
const { Op } = require("sequelize");

const loginhandler = async (req, res) => {
  try {
    const existingUser = getUser(req);
    console.log("[existingUser]: ", existingUser);
    if (!existingUser) {
      return res.status(400).send({
        message: "user not found",
      });
    }
    const hashedPassword = await createHashedPassword(req.body.password);
    const isSame = comparePasswords(existingUser.password, hashedPassword);
    if (isSame) {
      delete existingUser.password;
      const accessToken = createAccessToken(existingUser);
      res
        .cookie("accessToken", accessToken, {
          maxAge: 1000 * 60 * 60,
          httpOnly: true,
          secure: true,
          sameSite: none,
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

const getUser = (req, res) => {
  models.User.findOne({
    where: {
      userId: req.body.userId,
    },
  }).then((user) => {
    if (!user) return res.json({ data: null });
    else {
      return res.json(user);
    }
  });
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
  //console.log("[hash]: ", hash);
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
      //console.log(user.password);
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
  // id로 유저를 찾을 수 없는 경우 404를 응답한다
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
  getUser,
  getUserById,
  deleteById,
  createUser,
  validationCheck,
  updateUserById,
};
