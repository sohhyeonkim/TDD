const dotenv = require("dotenv");
dotenv.config();

const development = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false,
};
const test = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: "127.0.0.1",
  dialect: "mysql",
  logging: false,
};
const production = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: "127.0.0.1",
  dialect: "mysql",
};

module.exports = {
  development,
  test,
  production,
};
