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

module.exports = {
  getMaterials,
};