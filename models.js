// 데이터베이스 테이블에 대한 정의
const Sequelize = require("sequelize");
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite",
  logging: false,
});

const User = sequelize.define("User", {
  userId: {
    type: Sequelize.STRING,
    unique: true,
  },
  password: Sequelize.STRING,
  nickname: Sequelize.STRING,
});

module.exports = {
  Sequelize,
  sequelize,
  User,
};
