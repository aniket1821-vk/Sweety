
const prisma = require("../../lib/prisma");

const SLOT_LABELS = {
  MORNING: "Morning (fasting)",
  AFTER_BREAKFAST: "After breakfast",
  AFTER_LUNCH: "After lunch",
  AFTER_DINNER: "After dinner",
};

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

// Validate a date-only string and convert it to a UTC date
const parseReadingDate = (dateString) => {
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

// Acquire a transaction-level lock for one user's date
const lockUserDate = async (tx, userId, dateString) => {
  const lockKey = `${userId}:${dateString}`;

  await tx.$queryRaw`
    SELECT 1::int AS locked
    FROM pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))
  `;
};

// Check whether a reading slot is already occupied
const checkDuplicateSlot = async (
  tx,
  { userId, date, slot, excludeReadingId }
) => {
  const existingReading = await tx.reading.findFirst({
    where: {
      userId,
      date,
      slot,
      ...(excludeReadingId
        ? { id: { not: excludeReadingId } }
        : {}),
    },
  });

  if (existingReading) {
    throw createError(
      `You already have a ${SLOT_LABELS[slot]} reading for this date.`,
      409
    );
  }
};

// Check the maximum daily reading limit
const checkDailyLimit = async (
  tx,
  { userId, date, excludeReadingId }
) => {
  const readingCount = await tx.reading.count({
    where: {
      userId,
      date,
      ...(excludeReadingId
        ? { id: { not: excludeReadingId } }
        : {}),
    },
  });

  if (readingCount >= 4) {
    throw createError(
      "You can add only 4 readings per day.",
      400
    );
  }
};

// Create a new glucose reading
const createReading = async (userId, readingData) => {
  const { date: dateString, slot, value } = readingData;
  const date = parseReadingDate(dateString);

  return prisma.$transaction(async (tx) => {
    await lockUserDate(tx, userId, dateString);

    // Check duplicate slot before checking the daily limit
    await checkDuplicateSlot(tx, {
      userId,
      date,
      slot,
    });

    await checkDailyLimit(tx, {
      userId,
      date,
    });

    return tx.reading.create({
      data: {
        userId,
        date,
        slot,
        value,
      },
    });
  });
};

// Retrieve all readings belonging to the authenticated user
const getReadings = async (userId) => {
  return prisma.reading.findMany({
    where: { userId },
    orderBy: [
      { date: "desc" },
      { createdAt: "desc" },
    ],
  });
};

// Retrieve one reading belonging to the authenticated user
const getReadingById = async (userId, readingId) => {
  const reading = await prisma.reading.findFirst({
    where: {
      id: readingId,
      userId,
    },
  });

  if (!reading) {
    throw createError("Reading not found.", 404);
  }

  return reading;
};

// Update an existing reading
const updateReading = async (userId, readingId, readingData) => {
  const { date: dateString, slot, value } = readingData;
  const date = parseReadingDate(dateString);

  return prisma.$transaction(async (tx) => {
    await lockUserDate(tx, userId, dateString);

    const existingReading = await tx.reading.findFirst({
      where: {
        id: readingId,
        userId,
      },
    });

    if (!existingReading) {
      throw createError("Reading not found.", 404);
    }

    await checkDuplicateSlot(tx, {
      userId,
      date,
      slot,
      excludeReadingId: readingId,
    });

    await checkDailyLimit(tx, {
      userId,
      date,
      excludeReadingId: readingId,
    });

    return tx.reading.update({
      where: {
        id: existingReading.id,
      },
      data: {
        date,
        slot,
        value,
      },
    });
  });
};

// Delete an existing reading
const deleteReading = async (userId, readingId) => {
  const reading = await getReadingById(userId, readingId);

  await prisma.reading.delete({
    where: {
      id: reading.id,
    },
  });

  return reading;
};

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
};
