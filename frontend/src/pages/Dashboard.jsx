import { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import {
  getDashboardStats,
  getLowStockMaterials,
} from "../services/dashboardService";
import { getRecentTransactions } from "../services/transactionsService";

function Dashboard() {
  const [stats, setStats] = useState({
    materials: 0,
    machines: 0,
    employees: 0,
    stock: 0,
    lowStock: 0,
    transactions: 0,
  });

  const [lowStockMaterials, setLowStockMaterials] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, lowStockData, recentTransactionsData] =
          await Promise.all([
            getDashboardStats(),
            getLowStockMaterials(),
            getRecentTransactions(),
          ]);

        setStats(statsData);
        setLowStockMaterials(lowStockData);
        setRecentTransactions(recentTransactionsData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-1 text-gray-600">
            Overview of your maintenance management system.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Materials" value={stats.materials} />
          <StatCard title="Machines" value={stats.machines} />
          <StatCard title="Employees" value={stats.employees} />
          <StatCard title="Total Stock" value={stats.stock} />
          <StatCard title="Low Stock" value={stats.lowStock} />
          <StatCard title="Transactions" value={stats.transactions} />
        </div>

        {/* Low Stock Materials */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Low Stock Materials
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Materials that currently have 5 or fewer units.
            </p>
          </div>

          {lowStockMaterials.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-gray-600">No low stock materials.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-4 py-3">Part Number</th>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Machine</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Category</th>
                  </tr>
                </thead>

                <tbody>
                  {lowStockMaterials.map((material) => (
                    <tr key={material.id} className="border-b last:border-b-0">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {material.part_number}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {material.material_name}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {material.machine}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                          {material.quantity}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {material.category}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="mt-8 rounded-xl bg-white p-6 shadow">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Transactions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Latest material transactions.
            </p>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center">
              <p className="text-gray-600">No recent transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Part Number</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {recentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-b last:border-b-0"
                    >
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {transaction.employee_name}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {transaction.material_name}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {transaction.part_number}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {transaction.quantity}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                          {transaction.action}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-gray-500">
                        {new Date(transaction.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
