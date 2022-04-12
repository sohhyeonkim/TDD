const JWT = require("jsonwebtoken");

function decodeToken(token) {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.ACCESS_SECRET, (error, decoded) => {
      if (error) reject(error);
      resolve(decoded);
    });
  });
}

module.exports = decodeToken;
