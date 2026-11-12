
const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../middleware/validate");
const {
  registerSchema,
  loginSchema,
} = require("./auth.validation");

const router = express.Router();

// User registration
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

// User login
router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

module.exports = router;
