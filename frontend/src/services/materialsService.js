import api from "./api";

export const getMaterials = async () => {
  const response = await api.get("/materials");

  return response.data;
};

export const createMaterial = async (materialData) => {
  const response = await api.post("/materials", materialData);

  return response.data;
};

export const deleteMaterial = async (id) => {
  const response = await api.delete(`/materials/${id}`);

  return response.data;
};

export const updateMaterial = async (id, materialData) => {
  const response = await api.put(`/materials/${id}`, materialData);

  return response.data;
};
