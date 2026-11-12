

const authService = require("./auth.service");

// Register a new user
const register = async (req, res, next) => {
  try {
    const user = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Log in an existing user
const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
