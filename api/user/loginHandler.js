const bcrypt = require("bcrypt");

const createAccessToken = require("./utils/createAccessToken");
const { getUserByUserId } = require("./user.ctrl");

const loginHandler = async (req, res) => {
  try {
    if (!req.body.userId && !req.body.password) {
      return res.status(400).send({
        message: "userId or password not provided",
      });
    }
    const existingUser = await getUserByUserId(req.body.userId);
    if (!existingUser) {
      return res.status(400).send({
        message: "user not found",
      });
    }

    const isSame = await bcrypt.compare(
      req.body.password,
      existingUser.password
    );

    if (isSame) {
      delete existingUser.dataValues.password;

      const accessToken = createAccessToken(existingUser.dataValues);
      res
        .cookie("accessToken", accessToken, {
          maxAge: 9 * 60 * 60 * 1000 + 1000 * 60 * 60,
          httpOnly: true,
          //secure: true,
          sameSite: "none",
        })
        .status(200)
        .json({
          isLogin: true,
        })
        .end();
    } else {
      return res.status(400).json({
        isLogin: false,
        message: "wrong password",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = loginHandler;
