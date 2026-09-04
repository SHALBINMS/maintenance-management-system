import { useEffect, useState } from "react";
import {
  getMachines,
  createMachine,
  updateMachine,
  deleteMachine,
} from "../services/machinesService";

function Machines() {
  const [machines, setMachines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingMachine, setEditingMachine] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    machine_code: "",
    machine_name: "",
    location: "",
    status: "ACTIVE",
  });

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMachines();
      setMachines(data);
    } catch (err) {
      console.error("Failed to fetch machines:", err);

      setError(err.response?.data?.error || "Failed to load machines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // -------------------------
  // SEARCH
  // -------------------------

  const filteredMachines = machines.filter((machine) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      machine.machine_code?.toLowerCase().includes(search) ||
      machine.machine_name?.toLowerCase().includes(search) ||
      machine.location?.toLowerCase().includes(search) ||
      machine.status?.toLowerCase().includes(search)
    );
  });

  // -------------------------
  // ADD MODAL
  // -------------------------

  const openAddModal = () => {
    setEditingMachine(null);

    setFormData({
      machine_code: "",
      machine_name: "",
      location: "",
      status: "ACTIVE",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // -------------------------
  // EDIT MODAL
  // -------------------------

  const openEditModal = (machine) => {
    setEditingMachine(machine);

    setFormData({
      machine_code: machine.machine_code || "",
      machine_name: machine.machine_name || "",
      location: machine.location || "",
      status: machine.status || "ACTIVE",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingMachine(null);
  };

  // -------------------------
  // CHANGE
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
      !formData.machine_code.trim() ||
      !formData.machine_name.trim() ||
      !formData.location.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    try {
      setSubmitting(true);

      if (editingMachine) {
        await updateMachine(editingMachine.id, formData);

        setSuccess("Machine updated successfully.");
      } else {
        await createMachine(formData);

        setSuccess("Machine created successfully.");
      }

      setShowModal(false);
      setEditingMachine(null);

      setFormData({
        machine_code: "",
        machine_name: "",
        location: "",
        status: "ACTIVE",
      });

      await fetchMachines();
    } catch (err) {
      console.error("Failed to save machine:", err);

      setError(err.response?.data?.error || "Failed to save machine.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------
  // DELETE
  // -------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this machine?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteMachine(id);

      setSuccess("Machine deleted successfully.");

      await fetchMachines();
    } catch (err) {
      console.error("Failed to delete machine:", err);

      setError(err.response?.data?.error || "Failed to delete machine.");
    }
  };

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading machines...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Machines</h1>

            <p className="mt-1 text-gray-600">
              Manage machines in the maintenance system.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Machine
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
                  Machine List
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredMachines.length} machine
                  {filteredMachines.length !== 1 ? "s" : ""} found
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
                    placeholder="Search machines..."
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
                    Machine Code
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Machine Name
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
                {filteredMachines.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "No machines match your search."
                        : "No machines found."}
                    </td>
                  </tr>
                ) : (
                  filteredMachines.map((machine) => (
                    <tr key={machine.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {machine.id}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {machine.machine_code}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {machine.machine_name}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {machine.location}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            machine.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : machine.status === "MAINTENANCE"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {machine.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(machine)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(machine.id)}
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
                  {editingMachine ? "Edit Machine" : "Add Machine"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingMachine
                    ? "Update machine details."
                    : "Add a new machine."}
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
                  Machine Code
                </label>

                <input
                  name="machine_code"
                  value={formData.machine_code}
                  onChange={handleChange}
                  placeholder="MCH001"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Machine Name
                </label>

                <input
                  name="machine_name"
                  value={formData.machine_name}
                  onChange={handleChange}
                  placeholder="Conveyor"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Location
                </label>

                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Production Floor"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>

                  <option value="INACTIVE">INACTIVE</option>

                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
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
                    : editingMachine
                      ? "Update Machine"
                      : "Add Machine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Machines;
