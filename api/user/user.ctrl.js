const models = require("../../models");

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
  }).then(() => {
    return res.status(204).end();
  });
};
module.exports = {
  getUser,
  getUserById,
  deleteById,
};
