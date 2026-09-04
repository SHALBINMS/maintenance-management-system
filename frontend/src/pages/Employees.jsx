import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employeeService";

function Employees() {
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    employee_code: "",
    name: "",
    department: "",
  });

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error("Failed to fetch employees:", err);

      setError(err.response?.data?.error || "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // -------------------------
  // SEARCH
  // -------------------------

  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      employee.employee_code?.toLowerCase().includes(search) ||
      employee.name?.toLowerCase().includes(search) ||
      employee.department?.toLowerCase().includes(search)
    );
  });

  // -------------------------
  // OPEN ADD MODAL
  // -------------------------

  const openAddModal = () => {
    setEditingEmployee(null);

    setFormData({
      employee_code: "",
      name: "",
      department: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // -------------------------
  // OPEN EDIT MODAL
  // -------------------------

  const openEditModal = (employee) => {
    setEditingEmployee(employee);

    setFormData({
      employee_code: employee.employee_code || "",
      name: employee.name || "",
      department: employee.department || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingEmployee(null);
  };

  // -------------------------
  // FORM CHANGE
  // -------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -------------------------
  // CREATE / UPDATE
  // -------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.employee_code.trim() ||
      !formData.name.trim() ||
      !formData.department.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);

        setSuccess("Employee updated successfully.");
      } else {
        await createEmployee(formData);

        setSuccess("Employee created successfully.");
      }

      setShowModal(false);
      setEditingEmployee(null);

      setFormData({
        employee_code: "",
        name: "",
        department: "",
      });

      await fetchEmployees();
    } catch (err) {
      console.error("Failed to save employee:", err);

      setError(err.response?.data?.error || "Failed to save employee.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------
  // DELETE
  // -------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteEmployee(id);

      setSuccess("Employee deleted successfully.");

      await fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);

      setError(err.response?.data?.error || "Failed to delete employee.");
    }
  };

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employees</h1>

            <p className="mt-1 text-gray-600">
              Manage employees in the maintenance system.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Employee
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* TABLE CARD */}

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          {/* SEARCH */}

          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Employee List
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredEmployees.length} employee
                  {filteredEmployees.length !== 1 ? "s" : ""} found
                </p>
              </div>

              <div className="w-full sm:w-80">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔍
                  </span>

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employees..."
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>
            </div>
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
                    Employee Code
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Name
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Department
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "No employees match your search."
                        : "No employees found."}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.id}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {employee.employee_code}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.name}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee.department}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(employee)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(employee.id)}
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingEmployee ? "Edit Employee" : "Add Employee"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingEmployee
                    ? "Update employee details."
                    : "Add a new employee."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Employee Code
                </label>

                <input
                  name="employee_code"
                  value={formData.employee_code}
                  onChange={handleChange}
                  placeholder="EMP001"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Employee name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Department
                </label>

                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Maintenance"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingEmployee
                      ? "Update Employee"
                      : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
