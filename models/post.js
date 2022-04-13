"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.User);
      Post.belongsToMany(models.Hashtag, { through: "PostHashtag" });
    }
  }
  Post.init(
    {
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      img: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Post",
      timestamps: true,
      charset: "utf8mb4",
      collate: "utf8mb4_general_ci",
    }
  );
  return Post;
};
