import api from "./api";

export const getTransactions = async (filters = {}) => {
  const response = await api.get("/transactions", {
    params: filters,
  });

  return response.data;
};

export const createTransaction = async (transactionData) => {
  const response = await api.post("/transactions", transactionData);

  return response.data;
};

export const getRecentTransactions = async () => {
  const response = await api.get("/transactions", {
    params: {
      limit: 5,
    },
  });

  return response.data;
};
