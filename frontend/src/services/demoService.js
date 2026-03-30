const STORAGE_KEY = "batch-it.demo.batches";

const makeId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createDemoError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  error.userMessage = message;
  return error;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const demoUsers = {
  avery: {
    id: "demo-user-avery",
    name: "Avery Brooks",
    email: "avery@batchit.demo",
    role: "lead",
  },
  jamie: {
    id: "demo-user-jamie",
    name: "Jamie Flores",
    email: "jamie@batchit.demo",
    role: "analyst",
  },
  riley: {
    id: "demo-user-riley",
    name: "Riley Shah",
    email: "riley@batchit.demo",
    role: "designer",
  },
};

const seedDemoBatches = () => {
  const now = Date.now();

  return [
    {
      _id: "demo-batch-1",
      initiator: demoUsers.avery,
      buildingId: "North Tower · 7F",
      restaurantName: "Midnight Greens",
      status: "LIVE",
      expiresAt: new Date(now + 45 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 18 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 3 * 60 * 1000).toISOString(),
      items: [
        {
          _id: "demo-item-1",
          name: "Miso Grain Bowl",
          quantity: 2,
          price: 11.5,
          user: demoUsers.avery,
          createdAt: new Date(now - 16 * 60 * 1000).toISOString(),
        },
        {
          _id: "demo-item-2",
          name: "Citrus Tonic",
          quantity: 1,
          price: 4.75,
          user: demoUsers.jamie,
          createdAt: new Date(now - 11 * 60 * 1000).toISOString(),
        },
        {
          _id: "demo-item-3",
          name: "Sesame Greens",
          quantity: 1,
          price: 12.25,
          user: demoUsers.riley,
          createdAt: new Date(now - 3 * 60 * 1000).toISOString(),
        },
      ],
    },
    {
      _id: "demo-batch-2",
      initiator: demoUsers.jamie,
      buildingId: "South Annex · Lab 2",
      restaurantName: "Steam Theory",
      status: "CLOSED",
      expiresAt: new Date(now - 20 * 60 * 1000).toISOString(),
      createdAt: new Date(now - 120 * 60 * 1000).toISOString(),
      updatedAt: new Date(now - 35 * 60 * 1000).toISOString(),
      items: [
        {
          _id: "demo-item-4",
          name: "Katsu Bento",
          quantity: 2,
          price: 13.75,
          user: demoUsers.jamie,
          createdAt: new Date(now - 95 * 60 * 1000).toISOString(),
        },
        {
          _id: "demo-item-5",
          name: "Yuzu Soda",
          quantity: 3,
          price: 3.25,
          user: demoUsers.avery,
          createdAt: new Date(now - 90 * 60 * 1000).toISOString(),
        },
      ],
    },
  ];
};

const readBatches = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      const seeded = seedDemoBatches();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }

    return JSON.parse(raw);
  } catch {
    return seedDemoBatches();
  }
};

const writeBatches = (batches) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  return batches;
};

const normalizeUser = (user) => ({
  id: user?.id || user?._id || `guest-${Date.now()}`,
  name: user?.name || "Guest Collaborator",
  email: user?.email || "guest@batchit.demo",
  role: user?.role || "member",
});

const getBatchIndex = (batches, batchId) =>
  batches.findIndex((batch) => batch._id === batchId);

export const getDemoBatches = async () => {
  const batches = readBatches().sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  );

  return clone(batches);
};

export const getDemoBatchById = async (batchId) => {
  const batch = readBatches().find((entry) => entry._id === batchId);

  if (!batch) {
    throw createDemoError("Batch not found in demo workspace.", 404);
  }

  return clone(batch);
};

export const createDemoBatch = async (payload, user) => {
  const actor = normalizeUser(user);
  const now = new Date().toISOString();
  const items = Array.isArray(payload.items) ? payload.items : [];

  const batch = {
    _id: makeId(),
    initiator: actor,
    buildingId: payload.buildingId,
    restaurantName: payload.restaurantName,
    status: "LIVE",
    expiresAt: payload.expiresAt,
    createdAt: now,
    updatedAt: now,
    items: items.map((item) => ({
      _id: makeId(),
      name: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
      user: actor,
      createdAt: now,
    })),
  };

  const nextBatches = [batch, ...readBatches()];
  writeBatches(nextBatches);
  return clone(batch);
};

export const addDemoItem = async (batchId, payload, user) => {
  const batches = readBatches();
  const index = getBatchIndex(batches, batchId);

  if (index === -1) {
    throw createDemoError("Batch not found in demo workspace.", 404);
  }

  if (batches[index].status === "CLOSED") {
    throw createDemoError("This batch is already closed.", 400);
  }

  const actor = normalizeUser(user);
  const now = new Date().toISOString();

  batches[index].items.push({
    _id: makeId(),
    name: payload.name,
    quantity: Number(payload.quantity),
    price: Number(payload.price),
    user: actor,
    createdAt: now,
  });
  batches[index].updatedAt = now;

  writeBatches(batches);
  return clone(batches[index]);
};

export const closeDemoBatch = async (batchId) => {
  const batches = readBatches();
  const index = getBatchIndex(batches, batchId);

  if (index === -1) {
    throw createDemoError("Batch not found in demo workspace.", 404);
  }

  batches[index].status = "CLOSED";
  batches[index].updatedAt = new Date().toISOString();

  writeBatches(batches);
  return clone(batches[index]);
};

export const getDemoSummary = async (batchId) => {
  const batch = await getDemoBatchById(batchId);
  const summary = batch.items.reduce(
    (accumulator, item) => {
      accumulator.totalItems += Number(item.quantity) || 0;
      accumulator.totalAmount +=
        (Number(item.quantity) || 0) * (Number(item.price) || 0);
      return accumulator;
    },
    { batchId, totalItems: 0, totalAmount: 0 }
  );

  return summary;
};
