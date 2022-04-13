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

// const passfunc = async (p1, p2) => {
//   try {
//     const res = await comparePasswords(p1, p2);

//     console.log(res);
//     return res;
//   } catch (err) {
//     console.log("tq");
//   }
// };

// passfunc();

module.exports = comparePasswords;
