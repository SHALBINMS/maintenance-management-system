import { useEffect, useState } from "react";
import {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
} from "../services/machinesService";

function Machines() {
  const [machines, setMachines] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState("");
  const [machineCode, setMachineCode] = useState("");
  const [model, setModel] = useState("");
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("active");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      console.error("Failed to fetch machines:", err);
      setError("Failed to load machines.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setMachineCode("");
    setModel("");
    setLocation("");
    setStatus("active");
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");

    if (!name.trim()) {
      setFormError("Machine name is required.");
      return;
    }

    if (!machineCode.trim()) {
      setFormError("Machine code is required.");
      return;
    }

    try {
      setSubmitting(true);

      const machineData = {
        name: name.trim(),
        machine_code: machineCode.trim(),
        model: model.trim() || null,
        location: location.trim() || null,
        status,
      };

      if (editingId) {
        await updateMachine(editingId, machineData);
      } else {
        await createMachine(machineData);
      }

      resetForm();

      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      console.error("Failed to save machine:", err);

      setFormError(
        err.response?.data?.error ||
          "Failed to save machine. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (machine) => {
    setEditingId(machine.id);
    setName(machine.name || "");
    setMachineCode(machine.machine_code || "");
    setModel(machine.model || "");
    setLocation(machine.location || "");
    setStatus(machine.status || "active");

    setFormError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this machine?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteMachine(id);

      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      console.error("Failed to delete machine:", err);

      setError(
        err.response?.data?.error ||
          "Failed to delete machine. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading machines...</p>
      </div>
    );
  }

  if (error && machines.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">Machines</h1>

        <p className="mt-1 text-gray-600">
          Manage machines and their current status.
        </p>
      </div>

      {/* Add / Edit Machine Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-lg bg-white p-6 shadow-sm"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? "Edit Machine" : "Add Machine"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Machine Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Machine Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter machine name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Machine Code */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Machine Code
            </label>

            <input
              type="text"
              value={machineCode}
              onChange={(e) => setMachineCode(e.target.value)}
              placeholder="Enter machine code"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Model */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Model
            </label>

            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Enter machine model"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Location
            </label>

            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter machine location"
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
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? editingId
              ? "Updating..."
              : "Adding..."
            : editingId
              ? "Update Machine"
              : "Add Machine"}
        </button>
      </form>

      {/* Error */}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Machines Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                ID
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Code
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Machine
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Model
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Location
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
            {machines.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  No machines found.
                </td>
              </tr>
            ) : (
              machines.map((machine) => (
                <tr key={machine.id}>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {machine.id}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {machine.machine_code}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {machine.name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {machine.model || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-700">
                    {machine.location || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm">
                    <span
                      className={
                        machine.status === "active"
                          ? "font-medium text-green-600"
                          : machine.status === "maintenance"
                            ? "font-medium text-yellow-600"
                            : "font-medium text-gray-500"
                      }
                    >
                      {machine.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(machine)}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(machine.id)}
                        disabled={deletingId === machine.id}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === machine.id ? "Deleting..." : "Delete"}
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

export default Machines;
