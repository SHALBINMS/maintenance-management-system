import { useEffect, useState } from "react";
import { getStockMovements } from "../services/stockMovementService";

const StockHistory = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStockMovements();

      // API response array aanenkil direct use cheyyum
      // object response aanenkil common array keys check cheyyum
      const list = Array.isArray(data)
        ? data
        : data?.movements || data?.stockMovements || data?.data || [];

      setMovements(list);
    } catch (err) {
      console.error("Failed to fetch stock movements:", err);
      setError("Failed to load stock history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getMovementType = (movement) => {
    return (
      movement.movement_type || movement.type || movement.action || "STOCK IN"
    );
  };

  const getMaterialName = (movement) => {
    return (
      movement.material_name || movement.name || movement.material?.name || "-"
    );
  };

  const getQuantity = (movement) => {
    return movement.quantity ?? movement.qty ?? 0;
  };

  const getDate = (movement) => {
    return movement.created_at || movement.date || movement.movement_date;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Stock History</h1>

        <p className="text-sm text-gray-500 mt-1">
          View all stock movement records
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">Loading stock history...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && movements.length === 0 && (
        <div className="bg-white rounded-lg shadow p-10 text-center">
          <h2 className="text-lg font-semibold text-gray-700">
            No Stock Movements
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Stock movement records will appear here once stock is added or
            issued.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && movements.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    #
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Material
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Movement Type
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Quantity
                  </th>

                  <th className="px-6 py-3 text-left font-semibold text-gray-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {movements.map((movement, index) => {
                  const type = getMovementType(movement);
                  const quantity = getQuantity(movement);

                  const isStockIn = type
                    .toString()
                    .toUpperCase()
                    .includes("IN");

                  return (
                    <tr
                      key={movement.id || movement.stock_movement_id || index}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 text-gray-500">{index + 1}</td>

                      <td className="px-6 py-4 font-medium text-gray-800">
                        {getMaterialName(movement)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isStockIn
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {type}
                        </span>
                      </td>

                      <td
                        className={`px-6 py-4 font-semibold ${
                          isStockIn ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {isStockIn ? "+" : "-"}
                        {quantity}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(getDate(movement))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockHistory;
