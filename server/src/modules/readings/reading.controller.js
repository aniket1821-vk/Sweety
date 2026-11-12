
const readingService = require("./reading.service");

// Create a glucose reading
const createReading = async (req, res, next) => {
  try {
    const reading = await readingService.createReading(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Glucose reading created successfully.",
      data: { reading },
    });
  } catch (error) {
    next(error);
  }
};

// Get all readings for the authenticated user
const getReadings = async (req, res, next) => {
  try {
    const readings = await readingService.getReadings(req.user.id);

    return res.status(200).json({
      success: true,
      data: { readings },
    });
  } catch (error) {
    next(error);
  }
};

// Get one reading
const getReadingById = async (req, res, next) => {
  try {
    const reading = await readingService.getReadingById(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: { reading },
    });
  } catch (error) {
    next(error);
  }
};

// Update a reading
const updateReading = async (req, res, next) => {
  try {
    const reading = await readingService.updateReading(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Glucose reading updated successfully.",
      data: { reading },
    });
  } catch (error) {
    next(error);
  }
};

// Delete a reading
const deleteReading = async (req, res, next) => {
  try {
    const reading = await readingService.deleteReading(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Glucose reading deleted successfully.",
      data: { reading },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReading,
  getReadings,
  getReadingById,
  updateReading,
  deleteReading,
};
