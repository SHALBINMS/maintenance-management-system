const pool = require("../config/db");

const getEmployees = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT *
       FROM employees
       ORDER BY id DESC`,
    );

    res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching employees:", err.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const createEmployee = async (req, res) => {
  const { employee_code, name, department, position, phone, email, status } =
    req.body;

  if (!employee_code?.trim() || !name?.trim()) {
    return res.status(400).json({
      error: "Employee code and name are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO employees
       (employee_code, name, department, position, phone, email, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        employee_code.trim(),
        name.trim(),
        department?.trim() || null,
        position?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        status || "active",
      ],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating employee:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Employee code already exists",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;

  const { employee_code, name, department, position, phone, email, status } =
    req.body;

  if (!employee_code?.trim() || !name?.trim()) {
    return res.status(400).json({
      error: "Employee code and name are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE employees
       SET employee_code = $1,
           name = $2,
           department = $3,
           position = $4,
           phone = $5,
           email = $6,
           status = $7
       WHERE id = $8
       RETURNING *`,
      [
        employee_code.trim(),
        name.trim(),
        department?.trim() || null,
        position?.trim() || null,
        phone?.trim() || null,
        email?.trim() || null,
        status || "active",
        id,
      ],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error("Error updating employee:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Employee code already exists",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM employees WHERE id = $1",
      [id],
    );

    if (rowCount === 0) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    res.status(200).json({
      message: "Employee deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting employee:", err.message);

    if (err.code === "23503") {
      return res.status(409).json({
        error: "Employee cannot be deleted because transaction history exists",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
