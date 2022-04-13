const bcrypt = require("bcrypt");

const comparePasswords = async (inputPassword, storedPassword) => {
  try {
    const isSame = await bcrypt.compare(inputPassword, storedPassword);
    console.log(isSame);
    return isSame;
  } catch (err) {
    console.log("에러에러에러에러");
  }
};

module.exports = comparePasswords;
