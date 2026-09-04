import { useEffect, useState } from "react";
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../services/materialsService";

function Materials() {
  const [materials, setMaterials] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);

  const [editingMaterial, setEditingMaterial] = useState(null);
  const [stockMaterial, setStockMaterial] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [stockSubmitting, setStockSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    part_number: "",
    material_name: "",
    quantity: "",
    machine: "",
    category: "",
  });

  const [stockData, setStockData] = useState({
    quantity: "",
    reason: "",
  });

  // -------------------------
  // FETCH MATERIALS
  // -------------------------

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMaterials();
      setMaterials(data);
    } catch (err) {
      console.error("Failed to fetch materials:", err);

      setError(err.response?.data?.error || "Failed to load materials.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // -------------------------
  // SEARCH
  // -------------------------

  const filteredMaterials = materials.filter((material) => {
    const search = searchTerm.toLowerCase().trim();

    if (!search) return true;

    return (
      material.part_number?.toLowerCase().includes(search) ||
      material.material_name?.toLowerCase().includes(search) ||
      material.machine?.toLowerCase().includes(search) ||
      material.category?.toLowerCase().includes(search)
    );
  });

  // -------------------------
  // ADD MATERIAL
  // -------------------------

  const openAddModal = () => {
    setEditingMaterial(null);

    setFormData({
      part_number: "",
      material_name: "",
      quantity: "",
      machine: "",
      category: "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // -------------------------
  // EDIT MATERIAL
  // -------------------------

  const openEditModal = (material) => {
    setEditingMaterial(material);

    setFormData({
      part_number: material.part_number || "",
      material_name: material.material_name || "",
      quantity: material.quantity ?? "",
      machine: material.machine || "",
      category: material.category || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setShowModal(false);
    setEditingMaterial(null);
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
      !formData.part_number.trim() ||
      !formData.material_name.trim() ||
      formData.quantity === "" ||
      !formData.machine.trim() ||
      !formData.category.trim()
    ) {
      setError("Please fill all fields.");
      return;
    }

    if (Number(formData.quantity) < 0) {
      setError("Quantity cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);

      const data = {
        ...formData,
        quantity: Number(formData.quantity),
      };

      if (editingMaterial) {
        await updateMaterial(editingMaterial.id, data);

        setSuccess("Material updated successfully.");
      } else {
        await createMaterial(data);

        setSuccess("Material created successfully.");
      }

      setShowModal(false);
      setEditingMaterial(null);

      setFormData({
        part_number: "",
        material_name: "",
        quantity: "",
        machine: "",
        category: "",
      });

      await fetchMaterials();
    } catch (err) {
      console.error("Failed to save material:", err);

      setError(err.response?.data?.error || "Failed to save material.");
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------
  // DELETE
  // -------------------------

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this material?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteMaterial(id);

      setSuccess("Material deleted successfully.");

      await fetchMaterials();
    } catch (err) {
      console.error("Failed to delete material:", err);

      setError(err.response?.data?.error || "Failed to delete material.");
    }
  };

  // -------------------------
  // STOCK IN
  // -------------------------

  const openStockModal = (material) => {
    setStockMaterial(material);

    setStockData({
      quantity: "",
      reason: "",
    });

    setError("");
    setSuccess("");
    setShowStockModal(true);
  };

  const closeStockModal = () => {
    if (stockSubmitting) return;

    setShowStockModal(false);
    setStockMaterial(null);
  };

  const handleStockChange = (e) => {
    const { name, value } = e.target;

    setStockData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!stockData.quantity) {
      setError("Quantity is required.");
      return;
    }

    if (Number(stockData.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    if (!stockData.reason.trim()) {
      setError("Reason is required.");
      return;
    }

    try {
      setStockSubmitting(true);

      const response = await fetch("http://localhost:5000/api/stock/in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material_id: stockMaterial.id,
          quantity: Number(stockData.quantity),
          reason: stockData.reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add stock.");
      }

      setSuccess("Stock added successfully.");

      setShowStockModal(false);
      setStockMaterial(null);

      setStockData({
        quantity: "",
        reason: "",
      });

      await fetchMaterials();
    } catch (err) {
      console.error("Failed to add stock:", err);

      setError(err.message || "Failed to add stock.");
    } finally {
      setStockSubmitting(false);
    }
  };

  // -------------------------
  // LOADING
  // -------------------------

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Loading materials...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Materials</h1>

            <p className="mt-1 text-gray-600">
              Manage materials and inventory stock.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            + Add Material
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

        {/* SEARCH */}

        <div className="mb-4 rounded-lg bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Material Inventory
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredMaterials.length} material
                {filteredMaterials.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search materials..."
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Part Number
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Material
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Machine
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-sm text-gray-500"
                    >
                      {searchTerm
                        ? "No materials match your search."
                        : "No materials found."}
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((material) => (
                    <tr key={material.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {material.id}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {material.part_number}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {material.material_name}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            Number(material.quantity) <= 5
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {material.quantity}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {material.machine}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {material.category}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openStockModal(material)}
                            className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50"
                          >
                            Stock IN
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(material)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(material.id)}
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
                  {editingMaterial ? "Edit Material" : "Add Material"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {editingMaterial
                    ? "Update material details."
                    : "Add a new material."}
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
                  Part Number
                </label>

                <input
                  name="part_number"
                  value={formData.part_number}
                  onChange={handleChange}
                  placeholder="BL001"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Material Name
                </label>

                <input
                  name="material_name"
                  value={formData.material_name}
                  onChange={handleChange}
                  placeholder="Belt"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity
                </label>

                <input
                  type="number"
                  min="0"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Machine
                </label>

                <input
                  name="machine"
                  value={formData.machine}
                  onChange={handleChange}
                  placeholder="Conveyor"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Mechanical"
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
                    : editingMaterial
                      ? "Update Material"
                      : "Add Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK IN MODAL */}

      {showStockModal && stockMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Stock
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {stockMaterial.material_name} ({stockMaterial.part_number})
                </p>
              </div>

              <button
                type="button"
                onClick={closeStockModal}
                className="text-2xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-5 p-6">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Current Stock</span>

                  <span className="font-semibold text-gray-900">
                    {stockMaterial.quantity}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Quantity to Add
                </label>

                <input
                  type="number"
                  min="1"
                  name="quantity"
                  value={stockData.quantity}
                  onChange={handleStockChange}
                  placeholder="5"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Reason
                </label>

                <input
                  type="text"
                  name="reason"
                  value={stockData.reason}
                  onChange={handleStockChange}
                  placeholder="New stock received"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeStockModal}
                  disabled={stockSubmitting}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={stockSubmitting}
                  className="rounded-lg bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {stockSubmitting ? "Adding..." : "Add Stock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Materials;
