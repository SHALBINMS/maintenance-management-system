import api from "./api";

export const stockIn = async (stockData) => {
  const response = await api.post("/stock-movements/stock-in", stockData);

  return response.data;
};

export const getStockMovements = async () => {
  const response = await api.get("/stock-movements");

  return response.data;
};
