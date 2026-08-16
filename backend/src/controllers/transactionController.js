const pool = require("../config/db");

const createTransaction = async (req, res) => {
  const { material_id, employee_name, quantity } = req.body;

  const result = await pool.query("SELECT * FROM materials WHERE id = $1", [
    material_id,
  ]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Material not found" });
  }

  const material = result.rows[0];

  if (quantity > material.quantity) {
    return res.status(400).json({
      error: "Insufficient material quantity",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updatedMaterial = await client.query(
      `UPDATE materials
       SET quantity = quantity - $1
       WHERE id = $2
       RETURNING *`,
      [quantity, material_id],
    );

    const transaction = await client.query(
      `INSERT INTO transactions
       (material_id, employee_name, quantity, action)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [material_id, employee_name, quantity, "ISSUED"],
    );

    await client.query("COMMIT");

    res.status(201).json({
      transaction: transaction.rows[0],
      updatedMaterial: updatedMaterial.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Error creating transaction:", err.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  } finally {
    client.release();
  }
};

const getTransactions = async (req, res) => {
  try {
    const { employee } = req.query;

    let query = `
      SELECT
        transactions.id,
        transactions.employee_name,
        materials.material_name,
        materials.part_number,
        transactions.quantity,
        transactions.action,
        transactions.created_at
      FROM transactions
      JOIN materials
        ON transactions.material_id = materials.id
    `;

    let values = [];

    if (employee) {
      query += ` WHERE transactions.employee_name = $1`;
      values = [employee];
    }

    const result = await pool.query(query, values);

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching transactions:", err.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
};
