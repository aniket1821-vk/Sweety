
const express = require("express");
const { z } = require("zod");
const readingController = require("./reading.controller");
const authenticate = require("../../middleware/auth");
const validate = require("../../middleware/validate");

const {
  createReadingSchema,
  updateReadingSchema,
} = require("./reading.validation");

const router = express.Router();

// Validate reading ID in URL parameters
const readingIdSchema = z.object({
  id: z.string().uuid("Invalid reading ID."),
});

// All reading routes require authentication
router.use(authenticate);

// Create a glucose reading
router.post(
  "/",
  validate(createReadingSchema),
  readingController.createReading
);

// Get all readings for the authenticated user
router.get(
  "/",
  readingController.getReadings
);

// Get one reading by ID
router.get(
  "/:id",
  validate(readingIdSchema, "params"),
  readingController.getReadingById
);

// Update a reading
router.put(
  "/:id",
  validate(readingIdSchema, "params"),
  validate(updateReadingSchema),
  readingController.updateReading
);

// Delete a reading
router.delete(
  "/:id",
  validate(readingIdSchema, "params"),
  readingController.deleteReading
);

module.exports = router;
