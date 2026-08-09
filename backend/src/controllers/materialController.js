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

const updateMaterial = async (req, res) => {
  const { id } = req.params;
  const { part_number, material_name, quantity, machine, category } = req.body;
  try {
    const { rows } = await pool.query(
      "UPDATE materials SET part_number = $1, material_name = $2, quantity = $3, machine = $4, category = $5 WHERE id = $6 RETURNING *",
      [part_number, material_name, quantity, machine, category, id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error updating material:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteMaterial = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM materials WHERE id = $1", [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: "Material not found" });
    }
    res.status(200).json({ message: "Material deleted successfully" });
  } catch (err) {
    console.error("Error deleting material:", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
};