import { useEffect, useState } from "react";
import StatCard from "../components/dashboard/StatCard";
import { getDashboardStats } from "../services/dashboardService";

function Dashboard() {
  const [stats, setStats] = useState({
    materials: 0,
    machines: 0,
    employees: 0,
    stock: 0,
    lowStock: 0,
    transactions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
      </div>
    </div>
  );
}

export default Dashboard;
