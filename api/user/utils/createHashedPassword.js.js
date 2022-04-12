const bcrypt = require("bcrypt");

const createHashedPassword = (password) => {
  const saltRounds = 10;
  bcrypt.genSalt(saltRounds, function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      if (err) console.log(err);
      return hash;
    });
  });
};

module.exports = createHashedPassword;
