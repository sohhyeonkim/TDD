const express = require("express");
const router = express.Router();
const ctrl = require("./user.ctrl");

router.get("/", ctrl.getUser);
router.get("/:id", ctrl.getUserById);
router.delete("/:id", ctrl.deleteById);
router.post("/", ctrl.createUser);
module.exports = router;
