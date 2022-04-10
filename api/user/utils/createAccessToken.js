const JWT = require("jsonwebtoken");

const createAccessToken = (userData) => {
  const accessToken = JWT.sign(userData, process.env.ACCESS_SECRET, {
    expiresIn: "1h",
  });
  return accessToken;
};

module.exports = createAccessToken;
