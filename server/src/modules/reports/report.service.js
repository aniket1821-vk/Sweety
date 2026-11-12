
const prisma = require("../../lib/prisma");

// Create a consistent error with an HTTP status code
const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Get today's date in the configured application timezone
const getTodayInAppTimezone = () => {
  const timeZone = process.env.APP_TIME_ZONE || "Asia/Kolkata";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const dateParts = {};

  for (const part of parts) {
    if (part.type !== "literal") {
      dateParts[part.type] = part.value;
    }
  }

  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
};

// Validate a date-only string
const parseReportDate = (dateString) => {
  if (
    typeof dateString !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    throw createError("Please enter a valid date.", 400);
  }

  const date = new Date(`${dateString}T00:00:00.000Z`);

  // Reject impossible calendar dates
  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateString
  ) {
    throw createError("Please enter a valid date.", 400);
  }

  if (dateString > getTodayInAppTimezone()) {
    throw createError("Date cannot be in the future.", 400);
  }

  return date;
};

// Convert a date-only string to the next UTC midnight
const getNextDay = (dateString) => {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
};

// Calculate report statistics
const calculateStatistics = (readings) => {
  if (readings.length === 0) {
    return {
      highest: null,
      lowest: null,
      average: null,
      count: 0,
    };
  }

  const values = readings.map((reading) => reading.value);

  const total = values.reduce((sum, value) => sum + value, 0);

  return {
    highest: Math.max(...values),
    lowest: Math.min(...values),
    average: Number((total / values.length).toFixed(1)),
    count: values.length,
  };
};

// Retrieve readings within a date range for one user
const getReadingsInRange = async (userId, startDate, endDate) => {
  return prisma.reading.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate,
      },
    },
    orderBy: [
      { date: "asc" },
      { createdAt: "asc" },
    ],
  });
};

// Generate a daily report
const getDailyReport = async (userId, dateString) => {
  const date = parseReportDate(dateString);
  const nextDay = getNextDay(dateString);

  const readings = await getReadingsInRange(
    userId,
    date,
    nextDay
  );

  return {
    date: dateString,
    statistics: calculateStatistics(readings),
    readings,
  };
};

// Generate a month-to-date report
const getMonthToDateReport = async (userId, dateString) => {
  const selectedDate = parseReportDate(dateString);

  const year = selectedDate.getUTCFullYear();
  const month = selectedDate.getUTCMonth();

  const startDate = new Date(
    Date.UTC(year, month, 1)
  );

  const endDate = getNextDay(dateString);

  const readings = await getReadingsInRange(
    userId,
    startDate,
    endDate
  );

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: dateString,
    statistics: calculateStatistics(readings),
    readings,
  };
};

// Generate a report for the previous calendar month
const getMonthlyReport = async (userId, dateString) => {
  const selectedDate = parseReportDate(dateString);

  const year = selectedDate.getUTCFullYear();
  const month = selectedDate.getUTCMonth();

  const startDate = new Date(
    Date.UTC(year, month - 1, 1)
  );

  const endDate = new Date(
    Date.UTC(year, month, 1)
  );

  const readings = await getReadingsInRange(
    userId,
    startDate,
    endDate
  );

  return {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: new Date(endDate.getTime() - 86400000)
      .toISOString()
      .slice(0, 10),
    statistics: calculateStatistics(readings),
    readings,
  };
};

module.exports = {
  getDailyReport,
  getMonthToDateReport,
  getMonthlyReport,
};
