const pool = require("../config/db");

const getMachines = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM machines ORDER BY id ASC");

    res.json(rows);
  } catch (err) {
    console.error("Error fetching machines:", err.message);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const createMachine = async (req, res) => {
  const { name, machine_code, model, location, status } = req.body;

  if (!name || !machine_code) {
    return res.status(400).json({
      error: "Machine name and machine code are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO machines
        (name, machine_code, model, location, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, machine_code, model || null, location || null, status || "active"],
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating machine:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Machine code already exists",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const updateMachine = async (req, res) => {
  const { id } = req.params;

  const { name, machine_code, model, location, status } = req.body;

  if (!name || !machine_code) {
    return res.status(400).json({
      error: "Machine name and machine code are required",
    });
  }

  try {
    const { rows } = await pool.query(
      `UPDATE machines
       SET
         name = $1,
         machine_code = $2,
         model = $3,
         location = $4,
         status = $5
       WHERE id = $6
       RETURNING *`,
      [
        name,
        machine_code,
        model || null,
        location || null,
        status || "active",
        id,
      ],
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Machine not found",
      });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating machine:", err.message);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Machine code already exists",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

const deleteMachine = async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM machines WHERE id = $1",
      [id],
    );

    if (rowCount === 0) {
      return res.status(404).json({
        error: "Machine not found",
      });
    }

    res.status(200).json({
      message: "Machine deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting machine:", err.message);

    if (err.code === "23503") {
      return res.status(409).json({
        error: "Machine cannot be deleted because it has related records",
      });
    }

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
};
