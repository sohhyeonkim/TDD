const express = require("express");
const router = express.Router();
const ctrl = require("./user.ctrl");
//const loginHandler = require("./loginHandler");

router.get("/", ctrl.getUserByUserId);
router.get("/:id", ctrl.getUserById);
router.delete("/:id", ctrl.deleteById);
router.post("/", ctrl.createUser);
// router.post("/login", loginHandler);
router.post("/logout", ctrl.logoutHandelr);
router.post("/validationCheck", ctrl.validationCheck);
router.patch("/:id", ctrl.updateUserById);

module.exports = router;
