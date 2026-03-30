import {
  addDemoItem,
  closeDemoBatch,
  createDemoBatch,
  getDemoBatchById,
  getDemoBatches,
  getDemoSummary,
} from "./demoService";
import { api, canFallbackToDemo } from "./api";

const isDemoSession = (session) => session?.provider === "reqres";

const wrapResult = (data, source) => ({ data, source });

export const fetchBatches = async (session) => {
  if (isDemoSession(session)) {
    return wrapResult(await getDemoBatches(), "demo");
  }

  try {
    const response = await api.get("/batch");
    return wrapResult(response.data.data, "backend");
  } catch (error) {
    if (!canFallbackToDemo(error)) {
      throw error;
    }

    return wrapResult(await getDemoBatches(), "demo");
  }
};

export const fetchBatchById = async (batchId, session) => {
  if (isDemoSession(session)) {
    return wrapResult(await getDemoBatchById(batchId), "demo");
  }

  try {
    const response = await api.get(`/batch/${batchId}`);
    return wrapResult(response.data.data, "backend");
  } catch (error) {
    if (!canFallbackToDemo(error)) {
      throw error;
    }

    return wrapResult(await getDemoBatchById(batchId), "demo");
  }
};

export const fetchBatchSummary = async (batchId, session) => {
  if (isDemoSession(session)) {
    return wrapResult(await getDemoSummary(batchId), "demo");
  }

  try {
    const response = await api.get(`/batch/${batchId}/summary`);
    return wrapResult(response.data.data, "backend");
  } catch (error) {
    if (!canFallbackToDemo(error)) {
      throw error;
    }

    return wrapResult(await getDemoSummary(batchId), "demo");
  }
};

export const createBatch = async (payload, session) => {
  if (isDemoSession(session)) {
    return wrapResult(await createDemoBatch(payload, session?.user), "demo");
  }

  try {
    const response = await api.post("/batch/create", payload);
    return wrapResult(response.data.data, "backend");
  } catch (error) {
    if (!canFallbackToDemo(error)) {
      throw error;
    }

    return wrapResult(await createDemoBatch(payload, session?.user), "demo");
  }
};

export const addItemToBatch = async (batchId, payload, session) => {
  if (isDemoSession(session)) {
    return wrapResult(await addDemoItem(batchId, payload, session?.user), "demo");
  }

  try {
    const response = await api.post(`/batch/${batchId}/items`, payload);
    return wrapResult(response.data.data, "backend");
  } catch (error) {
    if (!canFallbackToDemo(error)) {
      throw error;
    }

    return wrapResult(await addDemoItem(batchId, payload, session?.user), "demo");
  }
};

export const closeBatch = async (batchId, session) => {
  if (isDemoSession(session)) {
    return wrapResult(await closeDemoBatch(batchId), "demo");
  }

  try {
    const response = await api.patch(`/batch/${batchId}/close`);
    return wrapResult(response.data.data, "backend");
  } catch (error) {
    if (!canFallbackToDemo(error)) {
      throw error;
    }

    return wrapResult(await closeDemoBatch(batchId), "demo");
  }
};
