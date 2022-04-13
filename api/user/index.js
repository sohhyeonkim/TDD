const express = require("express");
const router = express.Router();
const ctrl = require("./user.ctrl");

router.get("/", ctrl.getUserByUserId);
router.get("/:id", ctrl.getUserById);
router.delete("/:id", ctrl.deleteById);
router.post("/", ctrl.createUser);
router.post("/login", ctrl.loginhandler);
router.post("/logout", ctrl.logoutHandelr);
router.post("/validationCheck", ctrl.validationCheck);
router.patch("/:id", ctrl.updateUserById);

module.exports = router;
