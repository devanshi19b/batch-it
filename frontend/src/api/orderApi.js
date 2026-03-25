import API from "./axios";

export const getOrders = () => API.get("/orders");