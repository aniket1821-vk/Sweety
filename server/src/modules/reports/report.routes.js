
const express = require("express");
const reportController = require("./report.controller");
const authenticate = require("../../middleware/auth");
const validate = require("../../middleware/validate");
const { reportDateSchema } = require("./report.validation");

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

// Daily report
router.get(
  "/daily",
  validate(reportDateSchema, "query"),
  reportController.getDailyReport
);

// Month-to-date report
router.get(
  "/month-to-date",
  validate(reportDateSchema, "query"),
  reportController.getMonthToDateReport
);

// Previous calendar month report
router.get(
  "/monthly",
  validate(reportDateSchema, "query"),
  reportController.getMonthlyReport
);

module.exports = router;
