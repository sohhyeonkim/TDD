const models = require("../../models");
const createHashedPassword = require("./utils/createHashedPassword.js");
const { Op } = require("sequelize");

const getUser = (req, res) => {
  req.query.limit = req.query.limit || 10;
  const limit = parseInt(req.query.limit, 10);
  if (Number.isNaN(limit)) {
    return res.status(400).end();
  }

  models.User.findAll({ limit }).then((users) => {
    return res.json(users);
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
  getUser,
  getUserById,
  deleteById,
  createUser,
  validationCheck,
  updateUserById,
};
