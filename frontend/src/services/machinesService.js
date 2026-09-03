import api from "./api";

export const getMachines = async () => {
  const response = await api.get("/machines");

  return response.data;
};

export const createMachine = async (machineData) => {
  const response = await api.post("/machines", machineData);

  return response.data;
};

export const updateMachine = async (id, machineData) => {
  const response = await api.put(`/machines/${id}`, machineData);

  return response.data;
};

export const deleteMachine = async (id) => {
  const response = await api.delete(`/machines/${id}`);

  return response.data;
};
