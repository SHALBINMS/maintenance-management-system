import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import StatCard from "../components/dashboard/StatCard";
import { getDashboardStats } from "../services/dashboardService";
import { getRecentTransactions } from "../services/transactionsService";
import { getMaterials } from "../services/materialsService";

function Dashboard() {
  const [stats, setStats] = useState({
    materials: 0,
    machines: 0,
    employees: 0,
    stock: 0,
    lowStock: 0,
    transactions: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockMaterials, setLowStockMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [dashboardData, transactionData, materialData] =
          await Promise.all([
            getDashboardStats(),
            getRecentTransactions(),
            getMaterials(),
          ]);

        setStats(dashboardData);

        setRecentTransactions(transactionData.slice(0, 5));

        const lowStock = materialData
          .filter((material) => Number(material.quantity) <= 5)
          .sort((a, b) => Number(a.quantity) - Number(b.quantity))
          .slice(0, 5);

        setLowStockMaterials(lowStock);
      } catch (err) {
        console.error("Failed to load dashboard:", err);

        setError(err.response?.data?.error || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-red-50 px-6 py-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const healthyStock = Math.max(stats.materials - stats.lowStock, 0);

  const healthyPercentage =
    stats.materials > 0
      ? Math.round((healthyStock / stats.materials) * 100)
      : 100;

  const hasLowStock = Number(stats.lowStock) > 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-1 text-gray-600">
            Overview of your maintenance management system.
          </p>
        </div>

        {/* STAT CARDS */}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/materials">
            <StatCard title="Materials" value={stats.materials} />
          </Link>

          <Link to="/machines">
            <StatCard title="Machines" value={stats.machines} />
          </Link>

          <Link to="/employees">
            <StatCard title="Employees" value={stats.employees} />
          </Link>

          <Link to="/transactions">
            <StatCard title="Transactions" value={stats.transactions} />
          </Link>
        </div>

        {/* STOCK SUMMARY */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* TOTAL STOCK */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Stock</p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.stock}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Total available material quantity
                </p>
              </div>

              <div className="rounded-full bg-gray-100 px-4 py-2">📦</div>
            </div>
          </div>

          {/* LOW STOCK */}

          <Link
            to="/materials"
            className={`block rounded-xl p-6 shadow-sm transition hover:shadow-md ${
              hasLowStock ? "bg-red-50" : "bg-green-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    hasLowStock ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {hasLowStock ? "⚠ Low Stock" : "✓ Stock Healthy"}
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${
                    hasLowStock ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {stats.lowStock}
                </p>

                <p
                  className={`mt-1 text-sm ${
                    hasLowStock ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {hasLowStock
                    ? "Materials requiring attention"
                    : "No materials require attention"}
                </p>
              </div>

              <div
                className={`rounded-full px-4 py-2 ${
                  hasLowStock ? "bg-red-100" : "bg-green-100"
                }`}
              >
                {hasLowStock ? "⚠️" : "✓"}
              </div>
            </div>
          </Link>
        </div>

        {/* QUICK ACTIONS */}

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Common actions for managing the system.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/materials"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + Add Material
            </Link>

            <Link
              to="/transactions"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              📦 Issue Material
            </Link>

            <Link
              to="/employees"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + Add Employee
            </Link>

            <Link
              to="/machines"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              + Add Machine
            </Link>
          </div>
        </div>

        {/* LOW STOCK + INVENTORY STATUS */}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* LOW STOCK MATERIALS */}

          <div className="rounded-xl bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  ⚠ Low Stock Materials
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Materials with 5 or fewer units.
                </p>
              </div>

              <Link
                to="/materials"
                className="text-sm font-medium text-gray-700 hover:underline"
              >
                View All →
              </Link>
            </div>

            <div className="divide-y">
              {lowStockMaterials.length === 0 ? (
                <div className="px-6 py-8 text-center text-sm text-green-600">
                  ✓ All materials have healthy stock.
                </div>
              ) : (
                lowStockMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {material.material_name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {material.part_number}
                        {material.machine ? ` • ${material.machine}` : ""}
                      </p>
                    </div>

                    <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                      {material.quantity} units
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* INVENTORY STATUS */}

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Inventory Status
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Current material availability.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total Materials</p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {stats.materials}
                </p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Healthy Stock</p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {healthyStock}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Stock Health
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {healthyPercentage}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-gray-900 transition-all"
                  style={{
                    width: `${healthyPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RECENT TRANSACTIONS */}

        <div className="mt-8 overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Transactions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Latest material issue activity.
              </p>
            </div>

            <Link
              to="/transactions"
              className="text-sm font-medium text-gray-700 hover:underline"
            >
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Employee
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Material
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Quantity
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Time
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center text-sm text-gray-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.employee_name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {transaction.employee_code}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {transaction.material_name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {transaction.part_number}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {transaction.quantity}
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          {transaction.action}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {transaction.created_at
                          ? new Date(transaction.created_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
