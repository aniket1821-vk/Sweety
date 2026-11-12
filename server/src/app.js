
const express = require("express");
const cors = require("cors");

const prisma = require("./lib/prisma");

const authRoutes = require("./modules/auth/auth.routes");
const readingRoutes = require("./modules/readings/reading.routes");
const reportRoutes = require("./modules/reports/report.routes");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

// API health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sweety API is running!",
  });
});

// Database health check
app.get("/api/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Database connection successful!",
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Reading routes
app.use("/api/readings", readingRoutes);

// Report routes
app.use("/api/reports", reportRoutes);

// Centralized error handling (must be after all routes)
app.use(errorHandler);

module.exports = app;
