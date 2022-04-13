"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Hashtag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Hashtag.belongsToMany(models.Post, { through: "PostHashtag" });
    }
  }
  Hashtag.init(
    {
      title: {
        type: DataTypes.STRING(15),
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "Hashtag",
      charset: "utf8mb4",
      collage: "utf8mb4_general_ci",
    }
  );
  return Hashtag;
};
