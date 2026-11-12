
const { z } = require("zod");

const readingSlots = [
  "MORNING",
  "AFTER_BREAKFAST",
  "AFTER_LUNCH",
  "AFTER_DINNER",
];

const createReadingSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please enter a valid date."),

  slot: z.enum(readingSlots),

  value: z
    .number({
      error: "Please enter a glucose value.",
    })
    .int("Value must be between 40 and 600 mg/dl.")
    .min(40, "Value must be between 40 and 600 mg/dl.")
    .max(600, "Value must be between 40 and 600 mg/dl."),
});

const updateReadingSchema = createReadingSchema;

module.exports = {
  readingSlots,
  createReadingSchema,
  updateReadingSchema,
};
