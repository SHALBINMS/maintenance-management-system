const pool = require("../config/db");

const createTransaction = async (req, res) => {
  const { material_id, employee_id, quantity } = req.body;

  if (!material_id || !employee_id || !quantity) {
    return res.status(400).json({
      error: "Material, employee and quantity are required",
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

    // Check employee
    const employeeResult = await client.query(
      "SELECT * FROM employees WHERE id = $1",
      [employee_id],
    );

    if (employeeResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Employee not found",
      });
    }

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

    const material = materialResult.rows[0];

    // Check stock
    if (Number(quantity) > Number(material.quantity)) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        error: "Insufficient material quantity",
      });
    }

    // Reduce material quantity
    const updatedMaterial = await client.query(
      `UPDATE materials
       SET quantity = quantity - $1
       WHERE id = $2
       RETURNING *`,
      [quantity, material_id],
    );

    // Create transaction
    const transaction = await client.query(
      `INSERT INTO transactions
       (material_id, employee_id, quantity, action)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [material_id, employee_id, quantity, "ISSUED"],
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
    const { employee, material } = req.query;

    let query = `
      SELECT
        transactions.id,
        transactions.employee_id,
        employees.employee_code,
        employees.name AS employee_name,
        materials.id AS material_id,
        materials.material_name,
        materials.part_number,
        transactions.quantity,
        transactions.action,
        transactions.created_at
      FROM transactions
      JOIN employees
        ON transactions.employee_id = employees.id
      JOIN materials
        ON transactions.material_id = materials.id
    `;

    const values = [];
    const conditions = [];

    if (employee) {
      conditions.push(`employees.name = $${values.length + 1}`);
      values.push(employee);
    }

    if (material) {
      conditions.push(`materials.material_name = $${values.length + 1}`);
      values.push(material);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY transactions.created_at DESC";

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
