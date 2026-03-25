import API from "./axios";

export const getBatchById = async (id) => {
  const res = await API.get(`/batch/${id}`);
  return res.data;
};

export const removeItem = async (batchId, itemId) => {
  const res = await API.delete(`/batch/${batchId}/items/${itemId}`);
  return res.data;
};

export const getBatchSummary = async (id) => {
  const res = await API.get(`/batch/${id}/summary`);
  return res.data;
};