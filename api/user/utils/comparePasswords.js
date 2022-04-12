const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const comparePasswords = (inputPassword, storedPassword) => {
  bcrypt.compare(inputPassword, storedPassword, function (err, result) {
    console.log(result);
    return result;
  });
};

module.exports = comparePasswords;
