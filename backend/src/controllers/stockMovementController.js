const pool = require("../config/db");

const stockIn = async (req, res) => {
  const { material_id, quantity, reason } = req.body;

  // Validation
  if (!material_id || !quantity) {
    return res.status(400).json({
      error: "Material and quantity are required",
    });
  }

  if (Number(quantity) <= 0) {
    return res.status(400).json({
      error: "Quantity must be greater than 0",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check material
    const materialResult = await client.query(
      "SELECT * FROM materials WHERE id = $1 FOR UPDATE",
      [material_id],
    );

    if (materialResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Material not found",
      });
    }

    // Increase stock
    const updatedMaterial = await client.query(
      `UPDATE materials
       SET quantity = quantity + $1
       WHERE id = $2
       RETURNING *`,
      [quantity, material_id],
    );

    // Record stock movement
    const movement = await client.query(
      `INSERT INTO stock_movements
       (material_id, quantity, action, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [material_id, quantity, "IN", reason?.trim() || null],
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Stock added successfully",
      movement: movement.rows[0],
      material: updatedMaterial.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error adding stock:", err.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

const getStockMovements = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        stock_movements.id,
        stock_movements.material_id,
        materials.material_name,
        materials.part_number,
        stock_movements.quantity,
        stock_movements.action,
        stock_movements.reason,
        stock_movements.created_at
      FROM stock_movements
      JOIN materials
        ON stock_movements.material_id = materials.id
      ORDER BY stock_movements.created_at DESC
    `);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching stock movements:", err.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  stockIn,
  getStockMovements,
};
