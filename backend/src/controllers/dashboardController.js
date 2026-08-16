const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const materialsResult = await pool.query("SELECT COUNT(*) FROM materials");

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
      materials: materialsResult.rows[0].count,
      stock: stockResult.rows[0].total_stock,
      lowStock: lowstockResult.rows[0].low_stock,
      transactions: transactionsResult.rows[0].count,
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
