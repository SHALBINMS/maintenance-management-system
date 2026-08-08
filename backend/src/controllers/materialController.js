const pool = require("../config/db");

const getMaterials = async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM materials");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching materials:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createMaterial = async (req, res) => {
  const { part_number, material_name, quantity, machine, category } = req.body;
  try {
    const { rows } = await pool.query(
      "INSERT INTO materials (part_number, material_name, quantity, machine, category) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [part_number, material_name, quantity, machine, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Error creating material:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getMaterials,
createMaterial,
};