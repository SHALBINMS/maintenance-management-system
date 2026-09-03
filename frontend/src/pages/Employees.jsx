import { useEffect, useState } from "react";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/employeeService";

function Employees() {
  const [employees, setEmployees] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [employeeCode, setEmployeeCode] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  const fetchEmployees = async () => {
    try {
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

  const resetForm = () => {
    setEditingId(null);
    setEmployeeCode("");
    setName("");
    setDepartment("");
    setPosition("");
    setPhone("");
    setEmail("");
    setStatus("active");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!employeeCode.trim()) {
      setFormError("Employee code is required.");
      return;
    }

    if (!name.trim()) {
      setFormError("Employee name is required.");
      return;
    }

    try {
      setSubmitting(true);

      const employeeData = {
        employee_code: employeeCode.trim(),
        name: name.trim(),
        department: department.trim() || null,
        position: position.trim() || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        status,
      };

      if (editingId) {
        await updateEmployee(editingId, employeeData);
      } else {
        await createEmployee(employeeData);
      }

      resetForm();
      await fetchEmployees();
    } catch (err) {
      console.error("Failed to save employee:", err);

      setFormError(err.response?.data?.error || "Failed to save employee.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setEmployeeCode(employee.employee_code || "");
    setName(employee.name || "");
    setDepartment(employee.department || "");
    setPosition(employee.position || "");
    setPhone(employee.phone || "");
    setEmail(employee.email || "");
    setStatus(employee.status || "active");

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteEmployee(id);

      await fetchEmployees();
    } catch (err) {
      console.error("Failed to delete employee:", err);

      setError(err.response?.data?.error || "Failed to delete employee.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading employees...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Employees</h1>

        <p className="mt-1 text-gray-600">
          Manage company workers and employee information.
        </p>
      </div>

      {/* Add / Edit Employee Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-lg bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? "Edit Employee" : "Add Employee"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Employee Code */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Employee Code
            </label>

            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              placeholder="EMP001"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter employee name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Department
            </label>

            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Maintenance"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Position */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Position
            </label>

            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Technician"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Phone
            </label>

            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="employee@company.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:border-gray-500 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? editingId
                ? "Updating..."
                : "Adding..."
              : editingId
                ? "Update Employee"
                : "Add Employee"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Error */}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Employees Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
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
                Position
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Phone
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Status
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No employees found.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id}>
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
                    {employee.department || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.position || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {employee.phone || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={
                        employee.status === "active"
                          ? "font-medium text-green-600"
                          : "font-medium text-gray-500"
                      }
                    >
                      {employee.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(employee)}
                        className="rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(employee.id)}
                        disabled={deletingId === employee.id}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === employee.id ? "Deleting..." : "Delete"}
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
  );
}

export default Employees;
