import { useEffect, useState } from "react";
import {
  getTransactions,
  createTransaction,
} from "../services/transactionsService";
import { getEmployees } from "../services/employeeService";
import { getMaterials } from "../services/materialsService";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employee_id: "",
    material_id: "",
    quantity: "",
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [materialFilter, setMaterialFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 10;

  // --------------------------------
  // FETCH DATA
  // --------------------------------

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [transactionData, employeeData, materialData] = await Promise.all([
        getTransactions(),
        getEmployees(),
        getMaterials(),
      ]);

      setTransactions(transactionData);
      setEmployees(employeeData);
      setMaterials(materialData);
    } catch (err) {
      console.error("Failed to fetch transaction data:", err);

      setError(err.response?.data?.error || "Failed to load transaction data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------------
  // MODAL
  // --------------------------------

  const openModal = () => {
    setFormData({
      employee_id: "",
      material_id: "",
      quantity: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setError("");
  };

  // --------------------------------
  // FORM CHANGE
  // --------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --------------------------------
  // CREATE TRANSACTION
  // --------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.employee_id || !formData.material_id || !formData.quantity) {
      setError("Employee, material and quantity are required.");
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    const selectedMaterial = materials.find(
      (material) => Number(material.id) === Number(formData.material_id),
    );

    if (!selectedMaterial) {
      setError("Selected material not found.");
      return;
    }

    if (Number(formData.quantity) > Number(selectedMaterial.quantity)) {
      setError(
        `Insufficient stock. Available stock: ${selectedMaterial.quantity}`,
      );
      return;
    }

    try {
      setSubmitting(true);

      await createTransaction({
        material_id: Number(formData.material_id),
        employee_id: Number(formData.employee_id),
        quantity: Number(formData.quantity),
      });

      setShowModal(false);

      setFormData({
        employee_id: "",
        material_id: "",
        quantity: "",
      });

      setSuccess("Material issued successfully.");

      await fetchData();

      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to create transaction:", err);

      setError(err.response?.data?.error || "Failed to create transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  // --------------------------------
  // SEARCH + FILTER
  // --------------------------------

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

  // --------------------------------
  // PAGINATION
  // --------------------------------

  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage,
  );

  const startIndex = (currentPage - 1) * transactionsPerPage;

  const endIndex = startIndex + transactionsPerPage;

  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  // --------------------------------
  // FILTER HANDLERS
  // --------------------------------

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

  // --------------------------------
  // LOADING / ERROR
  // --------------------------------

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* HEADER */}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>

          <p className="mt-1 text-gray-600">
            View transaction history and issue materials to employees.
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          + Issue Material
        </button>
      </div>

      {/* SUCCESS */}

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* TRANSACTION HISTORY */}

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        {/* FILTER HEADER */}

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
            {/* SEARCH */}

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

            {/* EMPLOYEE */}

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

            {/* MATERIAL */}

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

            {/* ACTION */}

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

                <option value="IN">IN</option>
              </select>
            </div>

            {/* DATE */}

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

          {/* CLEAR FILTERS */}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">
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
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">
                      #{transaction.id}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {transaction.employee_name || "-"}
                      </p>

                      <p className="text-xs text-gray-500">
                        {transaction.employee_code || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transaction.material_name || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transaction.part_number || "-"}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-gray-700">
                      {transaction.quantity}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          transaction.action === "IN"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {transaction.action}
                      </span>
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
        </div>

        {/* PAGINATION */}

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
                    {
                      length: totalPages,
                    },
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

      {/* ISSUE MATERIAL MODAL */}

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Issue Material
                </h2>

                <p className="text-sm text-gray-500">
                  Issue material to an employee.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700 disabled:opacity-40"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-5">
                {/* EMPLOYEE */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Employee
                  </label>

                  <select
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
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

                {/* MATERIAL */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Material
                  </label>

                  <select
                    name="material_id"
                    value={formData.material_id}
                    onChange={handleChange}
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

                {/* QUANTITY */}

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter quantity"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Issuing..." : "Issue Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSACTION DETAILS MODAL */}

      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedTransaction(null)}
        >
          <div
            className="w-full max-w-lg rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}

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

            {/* DETAILS */}

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

            {/* FOOTER */}

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
