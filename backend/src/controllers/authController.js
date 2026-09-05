const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, hashedPassword, "user"],
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error registering user:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (role?.trim().toLowerCase() !== "admin") {
      return res.status(400).json({
        error: 'Admin account role must be "admin"',
      });
    }

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.trim()],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name.trim(), email.trim(), hashedPassword, "admin"],
    );

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Error creating admin account:", err.message);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error logging in user:", err.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user?.id;

  if (!userId || !currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      error: "Current password, new password and confirmation are required",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      error: "New password and confirmation do not match",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters",
    });
  }

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      result.rows[0].password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      userId,
    ]);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Error changing password:", err.message);

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  registerUser,
  createAdminUser,
  loginUser,
  changePassword,
};
