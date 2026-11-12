
const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Duplicate database record
  if (err.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A record with this information already exists.",
    });
  }

  // Invalid JSON request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request body.",
    });
  }

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode === 500
        ? "Internal server error."
        : err.message,
  });
};

module.exports = errorHandler;
