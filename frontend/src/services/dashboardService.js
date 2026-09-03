import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getLowStockMaterials = async () => {
  const response = await api.get("/dashboard/low-stock");
  return response.data;
};
