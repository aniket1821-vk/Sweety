
const reportService = require("./report.service");

// Get daily report
const getDailyReport = async (req, res, next) => {
  try {
    const report = await reportService.getDailyReport(
      req.user.id,
      req.query.date
    );

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

// Get month-to-date report
const getMonthToDateReport = async (req, res, next) => {
  try {
    const report = await reportService.getMonthToDateReport(
      req.user.id,
      req.query.date
    );

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

// Get previous calendar month report
const getMonthlyReport = async (req, res, next) => {
  try {
    const report = await reportService.getMonthlyReport(
      req.user.id,
      req.query.date
    );

    return res.status(200).json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
};
