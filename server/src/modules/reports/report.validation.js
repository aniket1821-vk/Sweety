
const { z } = require("zod");

// Validate date query parameter (YYYY-MM-DD)
const reportDateSchema = z.object({
  date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Please enter a valid date."
    ),
});

module.exports = {
  reportDateSchema,
};
