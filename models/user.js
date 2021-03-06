"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Post);
    }
  }
  User.init(
    {
      userId: DataTypes.STRING,
      password: DataTypes.STRING,
      nickname: DataTypes.STRING,
    },
    {
      sequelize,
      timestamps: true,
      modelName: "User",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  return User;
};
