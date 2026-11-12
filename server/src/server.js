
require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`Sweety API running on http://localhost:${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down Sweety API...");

  server.close(async () => {
    const prisma = require("./lib/prisma");
    await prisma.$disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
