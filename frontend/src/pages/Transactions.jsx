import { useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
} from "../services/transactionService";
import { getEmployees } from "../services/employeeService";
import { getMaterials } from "../services/materialsService";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [materialId, setMaterialId] = useState("");
  const [quantity, setQuantity] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // Transaction details
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [transactionData, employeeData, materialData] = await Promise.all(
          [getTransactions(), getEmployees(), getMaterials()],
        );

        setTransactions(transactionData);
        setEmployees(employeeData);
        setMaterials(materialData);
      } catch (err) {
        console.error("Failed to load transaction data:", err);

        setError(
          err.response?.data?.error || "Failed to load transaction data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateTransaction = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccess("");

    if (!employeeId) {
      setFormError("Please select an employee.");
      return;
    }

    if (!materialId) {
      setFormError("Please select a material.");
      return;
    }

    if (quantity === "" || Number(quantity) <= 0) {
      setFormError("Please enter a valid quantity.");
      return;
    }

    const selectedMaterial = materials.find(
      (material) => Number(material.id) === Number(materialId),
    );

    if (!selectedMaterial) {
      setFormError("Selected material not found.");
      return;
    }

    if (Number(quantity) > Number(selectedMaterial.quantity)) {
      setFormError(`Only ${selectedMaterial.quantity} units are available.`);
      return;
    }

    try {
      setSubmitting(true);

      await createTransaction({
        material_id: Number(materialId),
        employee_id: Number(employeeId),
        quantity: Number(quantity),
      });

      setSuccess("Material issued successfully.");

      setEmployeeId("");
      setMaterialId("");
      setQuantity("");

      const [transactionData, materialData] = await Promise.all([
        getTransactions(),
        getMaterials(),
      ]);

      setTransactions(transactionData);
      setMaterials(materialData);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to create transaction:", err);

      setFormError(
        err.response?.data?.error || "Failed to create transaction.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Search + filters
  const filteredTransactions = transactions.filter((transaction) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      !search ||
      transaction.employee_name?.toLowerCase().includes(search) ||
      transaction.material_name?.toLowerCase().includes(search) ||
      transaction.part_number?.toLowerCase().includes(search) ||
      String(transaction.id).includes(search) ||
      transaction.action?.toLowerCase().includes(search);

    const matchesEmployee =
      !employeeFilter ||
      Number(transaction.employee_id) === Number(employeeFilter);

    const matchesMaterial =
      !materialFilter ||
      Number(transaction.material_id) === Number(materialFilter);

    const matchesAction = !actionFilter || transaction.action === actionFilter;

    let matchesDate = true;

    if (dateFilter && transaction.created_at) {
      const transactionDate = new Date(transaction.created_at);
      const now = new Date();

      if (dateFilter === "today") {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        matchesDate = transactionDate >= startOfToday;
      }

      if (dateFilter === "7days") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        matchesDate = transactionDate >= sevenDaysAgo;
      }

      if (dateFilter === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        matchesDate = transactionDate >= thirtyDaysAgo;
      }
    }

    return (
      matchesSearch &&
      matchesEmployee &&
      matchesMaterial &&
      matchesAction &&
      matchesDate
    );
  });

  // Pagination
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage,
  );

  const startIndex = (currentPage - 1) * transactionsPerPage;

  const endIndex = startIndex + transactionsPerPage;

  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset page when filters change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEmployeeFilterChange = (e) => {
    setEmployeeFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleMaterialFilterChange = (e) => {
    setMaterialFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleActionFilterChange = (e) => {
    setActionFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleDateFilterChange = (e) => {
    setDateFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setEmployeeFilter("");
    setMaterialFilter("");
    setActionFilter("");
    setDateFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm ||
    employeeFilter ||
    materialFilter ||
    actionFilter ||
    dateFilter;

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>

        <p className="mt-1 text-gray-600">
          Issue materials to employees and view transaction history.
        </p>
      </div>

      {/* Issue Material */}
      <form
        onSubmit={handleCreateTransaction}
        className="mb-8 rounded-lg bg-white p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          Issue Material
        </h2>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Employee */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee
            </label>

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-gray-500 focus:outline-none"
            >
              <option value="">Select employee</option>

              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employee_code})
                </option>
              ))}
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material
            </label>

            <select
              value={materialId}
              onChange={(e) => setMaterialId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-gray-500 focus:outline-none"
            >
              <option value="">Select material</option>

              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.material_name} — Stock: {material.quantity}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

        {success && <p className="mt-4 text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Issuing..." : "Issue Material"}
        </button>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Transaction History */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        {/* Filters */}
        <div className="border-b border-gray-200 px-6 py-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Transaction History
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Search
              </label>

              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Employee, material, part number..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
              />
            </div>

            {/* Employee */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Employee
              </label>

              <select
                value={employeeFilter}
                onChange={handleEmployeeFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                <option value="">All Employees</option>

                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Material
              </label>

              <select
                value={materialFilter}
                onChange={handleMaterialFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                <option value="">All Materials</option>

                {materials.map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.material_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Action */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Action
              </label>

              <select
                value={actionFilter}
                onChange={handleActionFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                <option value="">All Actions</option>
                <option value="ISSUED">ISSUED</option>
                <option value="RETURNED">RETURNED</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Date
              </label>

              <select
                value={dateFilter}
                onChange={handleDateFilterChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-gray-500 focus:outline-none"
              >
                <option value="">All Time</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Table */}
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                ID
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Employee
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Material
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Part Number
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Quantity
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Action
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Date
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Details
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {currentTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  {hasActiveFilters
                    ? "No transactions match your filters."
                    : "No transactions found."}
                </td>
              </tr>
            ) : (
              currentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {transaction.id}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {transaction.employee_name || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {transaction.material_name || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {transaction.part_number || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {transaction.quantity}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-700">
                    {transaction.action}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-500">
                    {transaction.created_at
                      ? new Date(transaction.created_at).toLocaleString()
                      : "-"}
                  </td>

                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedTransaction(transaction)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {filteredTransactions.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium text-gray-900">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-gray-900">
                {Math.min(endIndex, filteredTransactions.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-gray-900">
                {filteredTransactions.length}
              </span>
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.max(page - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium ${
                        currentPage === page
                          ? "bg-gray-900 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Transaction Details
                </h2>

                <p className="text-sm text-gray-500">
                  Transaction #{selectedTransaction.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4 px-6 py-6">
              <div className="flex justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Transaction ID</span>

                <span className="font-medium text-gray-900">
                  #{selectedTransaction.id}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Action</span>

                <span className="font-medium text-gray-900">
                  {selectedTransaction.action || "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Employee</span>

                <span className="font-medium text-gray-900">
                  {selectedTransaction.employee_name || "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Employee Code</span>

                <span className="font-medium text-gray-900">
                  {selectedTransaction.employee_code || "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Material</span>

                <span className="font-medium text-gray-900">
                  {selectedTransaction.material_name || "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Part Number</span>

                <span className="font-medium text-gray-900">
                  {selectedTransaction.part_number || "-"}
                </span>
              </div>

              <div className="flex justify-between border-b pb-3">
                <span className="text-sm text-gray-500">Quantity</span>

                <span className="font-medium text-gray-900">
                  {selectedTransaction.quantity}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Date</span>

                <span className="text-right font-medium text-gray-900">
                  {selectedTransaction.created_at
                    ? new Date(selectedTransaction.created_at).toLocaleString()
                    : "-"}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 text-right">
              <button
                type="button"
                onClick={() => setSelectedTransaction(null)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;
