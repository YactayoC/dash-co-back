const express = require("express");
const {
  authController,
  registerController,
} = require("../controllers/auth-controller");

const router = express.Router();

router.post("/auth/login", authController);
router.post("/auth/register", registerController);

module.exports = router;
