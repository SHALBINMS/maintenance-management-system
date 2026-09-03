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

      const response = await createTransaction({
        material_id: Number(materialId),
        employee_id: Number(employeeId),
        quantity: Number(quantity),
      });

      setSuccess("Material issued successfully.");

      setEmployeeId("");
      setMaterialId("");
      setQuantity("");

      // Refresh transactions and materials
      const [transactionData, materialData] = await Promise.all([
        getTransactions(),
        getMaterials(),
      ]);

      setTransactions(transactionData);
      setMaterials(materialData);

      console.log("Transaction created:", response);
    } catch (err) {
      console.error("Failed to create transaction:", err);

      setFormError(
        err.response?.data?.error || "Failed to create transaction.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>

        <p className="mt-1 text-gray-600">
          Issue materials to employees and view transaction history.
        </p>
      </div>

      {/* Issue Material Form */}
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

      {/* Error */}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Transaction History */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h2>
        </div>

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
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {transactions.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No transactions found.
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Transactions;
