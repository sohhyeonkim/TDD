const models = require("../../models/index");

const isAvailableUserId = async (id) => {
  const existingUser = await models.User.findOne({
    where: {
      id,
    },
  });

  if (existingUser) {
    return true;
  }
  return false;
};

module.exports = isAvailableUserId;
