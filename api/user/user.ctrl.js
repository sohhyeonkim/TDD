const models = require("../../models");
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

const createUser = (req, res) => {
  const { userId, password, nickname } = req.body;
  if (!userId || !password || !nickname) {
    return res.status(400).end();
  }
  models.User.findOrCreate({
    where: {
      [Op.or]: [{ userId }, { nickname }],
    },
  }).then(([user, created]) => {
    if (created) {
      return res.json(user);
    }
    return res.status(409).end();
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
  }
  if (nickname) {
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
  }
};

module.exports = {
  getUser,
  getUserById,
  deleteById,
  createUser,
  validationCheck,
};
