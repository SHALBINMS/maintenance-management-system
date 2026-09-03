const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const materialsResult = await pool.query("SELECT COUNT(*) FROM materials");

    const machinesResult = await pool.query("SELECT COUNT(*) FROM machines");

    const employeesResult = await pool.query("SELECT COUNT(*) FROM employees");

    const transactionsResult = await pool.query(
      "SELECT COUNT(*) FROM transactions",
    );

    const stockResult = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_stock
       FROM materials`,
    );

    const lowstockResult = await pool.query(
      `SELECT COUNT(*) AS low_stock
       FROM materials
       WHERE quantity <= 5`,
    );

    res.status(200).json({
      materials: Number(materialsResult.rows[0].count),
      machines: Number(machinesResult.rows[0].count),
      employees: Number(employeesResult.rows[0].count),
      stock: Number(stockResult.rows[0].total_stock),
      lowStock: Number(lowstockResult.rows[0].low_stock),
      transactions: Number(transactionsResult.rows[0].count),
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err.message);

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  getDashboardStats,
};
