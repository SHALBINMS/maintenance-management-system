import { useEffect, useState } from "react";
import {
  getMaterials,
  createMaterial,
  deleteMaterial,
  updateMaterial,
} from "../services/materialsService";

function Materials() {
  const [materials, setMaterials] = useState([]);

  // Edit state
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [partNumber, setPartNumber] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [machine, setMachine] = useState("");
  const [category, setCategory] = useState("");

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");

  // Fetch materials
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getMaterials();
        setMaterials(data);
      } catch (err) {
        console.error("Failed to fetch materials:", err);
        setError("Failed to load materials.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  // Start editing a material
  const handleEditMaterial = (material) => {
    setEditingId(material.id);

    setPartNumber(material.part_number || "");
    setMaterialName(material.material_name || "");
    setQuantity(material.quantity ?? "");
    setMachine(material.machine || "");
    setCategory(material.category || "");

    setFormError("");
    setError("");

    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel edit / reset form
  const handleCancelEdit = () => {
    setEditingId(null);

    setPartNumber("");
    setMaterialName("");
    setQuantity("");
    setMachine("");
    setCategory("");

    setFormError("");
  };

  // Create / Update material
  const handleCreateMaterial = async (e) => {
    e.preventDefault();

    setFormError("");
    setError("");

    // Validation
    if (!materialName.trim()) {
      setFormError("Material name is required.");
      return;
    }

    if (quantity === "" || Number(quantity) < 0) {
      setFormError("Please enter a valid quantity.");
      return;
    }

    const materialData = {
      part_number: partNumber.trim() || null,
      material_name: materialName.trim(),
      quantity: Number(quantity),
      machine: machine.trim() || null,
      category: category.trim() || null,
    };

    try {
      setSubmitting(true);

      // Edit mode
      if (editingId) {
        await updateMaterial(editingId, materialData);
      }
      // Create mode
      else {
        await createMaterial(materialData);
      }

      // Reset form
      handleCancelEdit();

      // Refresh materials
      const data = await getMaterials();
      setMaterials(data);
    } catch (err) {
      console.error(
        editingId ? "Failed to update material:" : "Failed to create material:",
        err,
      );

      setFormError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (editingId
            ? "Failed to update material."
            : "Failed to create material."),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete material
  const handleDeleteMaterial = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this material?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteMaterial(id);

      const data = await getMaterials();
      setMaterials(data);
    } catch (err) {
      console.error("Failed to delete material:", err);

      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to delete material. Please try again.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Loading materials...</p>
      </div>
    );
  }

  // Initial loading error
  if (error && materials.length === 0) {
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
        <h1 className="text-3xl font-bold text-gray-900">Materials</h1>

        <p className="mt-1 text-gray-600">
          Manage materials and inventory stock.
        </p>
      </div>

      {/* Add / Edit Material Form */}
      <form
        onSubmit={handleCreateMaterial}
        className="mb-8 rounded-lg bg-white p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold text-gray-900">
          {editingId ? "Edit Material" : "Add Material"}
        </h2>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Part Number */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Part Number
            </label>

            <input
              type="text"
              value={partNumber}
              onChange={(e) => setPartNumber(e.target.value)}
              placeholder="Enter part number"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Material Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Material Name
            </label>

            <input
              type="text"
              value={materialName}
              onChange={(e) => setMaterialName(e.target.value)}
              placeholder="Enter material name"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Machine */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Machine
            </label>

            <input
              type="text"
              value={machine}
              onChange={(e) => setMachine(e.target.value)}
              placeholder="Enter machine"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Form Error */}
        {formError && <p className="mt-4 text-sm text-red-600">{formError}</p>}

        {/* Form Buttons */}
        <div className="mt-5">
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
                ? "Update Material"
                : "Add Material"}
          </button>

          {/* Cancel Edit */}
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={submitting}
              className="ml-3 rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Delete / Other Error */}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {/* Materials Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
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
            {materials.map((material) => (
              <tr key={material.id}>
                {/* ID */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {material.id}
                </td>

                {/* Part Number */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {material.part_number || "-"}
                </td>

                {/* Material */}
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {material.material_name}
                </td>

                {/* Quantity */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {material.quantity}
                </td>

                {/* Machine */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {material.machine || "-"}
                </td>

                {/* Category */}
                <td className="px-6 py-4 text-sm text-gray-700">
                  {material.category || "-"}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleEditMaterial(material)}
                    disabled={deletingId === material.id}
                    className="mr-2 rounded-lg bg-gray-700 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteMaterial(material.id)}
                    disabled={deletingId === material.id}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {deletingId === material.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Materials;
