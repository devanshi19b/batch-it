const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "batch-it-test-secret";
process.env.MONGO_URI = "";

const { startServer } = require("../src/server");
const { resetStore } = require("../src/utils/memoryStore");

let server;
let baseUrl;

const registerUser = async ({
  name,
  email,
  password = "secret123",
}) => {
  const response = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  assert.equal(response.status, 201);
  return response.body.data;
};

const createBatch = async (token, overrides = {}) => {
  const response = await request("/api/batch/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      buildingId: "Tower A",
      restaurantName: "Urban Slice",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      ...overrides,
    }),
  });

  return response;
};

const request = async (path, options = {}) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json();
  return {
    status: response.status,
    body,
  };
};

test.before(async () => {
  server = await startServer({ port: 0 });
  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test.beforeEach(() => {
  resetStore();
});

test("health endpoint responds successfully", async () => {
  const response = await request("/health");

  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.equal(response.body.data.database, "memory");
  assert.equal(response.body.data.fallbackMode, true);
});

test("auth and batch flow works end to end", async () => {
  const { token } = await registerUser({
    name: "Devanshi",
    email: "devanshi@example.com",
  });
  assert.ok(token);

  const createBatchResponse = await createBatch(token);
  assert.equal(createBatchResponse.status, 201);
  assert.equal(createBatchResponse.body.success, true);

  const batchId = createBatchResponse.body.data._id;
  assert.ok(batchId);

  const addItemResponse = await request(`/api/batch/${batchId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Pizza",
      quantity: 2,
      price: 200,
    }),
  });

  assert.equal(addItemResponse.status, 200);
  assert.equal(addItemResponse.body.data.items.length, 1);

  const summaryResponse = await request(`/api/batch/${batchId}/summary`);

  assert.equal(summaryResponse.status, 200);
  assert.equal(summaryResponse.body.data.totalItems, 2);
  assert.equal(summaryResponse.body.data.totalAmount, 400);
});

test("register and login validation errors are returned", async () => {
  const invalidRegister = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "",
      email: "not-an-email",
      password: "123",
    }),
  });

  assert.equal(invalidRegister.status, 400);

  const invalidLogin = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: "missing@example.com",
      password: "wrongpass",
    }),
  });

  assert.equal(invalidLogin.status, 401);
});

test("batch creation rejects expired deadlines", async () => {
  const { token } = await registerUser({
    name: "Owner",
    email: "owner@example.com",
  });

  const response = await createBatch(token, {
    expiresAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.message, "expiresAt must be in the future.");
});

test("only the batch creator can close a batch", async () => {
  const owner = await registerUser({
    name: "Owner",
    email: "owner@example.com",
  });
  const teammate = await registerUser({
    name: "Teammate",
    email: "teammate@example.com",
  });

  const createResponse = await createBatch(owner.token);
  const batchId = createResponse.body.data._id;

  const forbiddenClose = await request(`/api/batch/${batchId}/close`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${teammate.token}`,
    },
  });

  assert.equal(forbiddenClose.status, 403);

  const validClose = await request(`/api/batch/${batchId}/close`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${owner.token}`,
    },
  });

  assert.equal(validClose.status, 200);
  assert.equal(validClose.body.data.status, "CLOSED");
});

test("only the item owner or batch creator can remove an item", async () => {
  const owner = await registerUser({
    name: "Owner",
    email: "owner@example.com",
  });
  const teammate = await registerUser({
    name: "Teammate",
    email: "teammate@example.com",
  });
  const stranger = await registerUser({
    name: "Stranger",
    email: "stranger@example.com",
  });

  const createResponse = await createBatch(owner.token);
  const batchId = createResponse.body.data._id;

  const addItemResponse = await request(`/api/batch/${batchId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${teammate.token}`,
    },
    body: JSON.stringify({
      name: "Burger",
      quantity: 1,
      price: 120,
    }),
  });

  const itemId = addItemResponse.body.data.items[0]._id;

  const strangerRemove = await request(`/api/batch/${batchId}/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${stranger.token}`,
    },
  });

  assert.equal(strangerRemove.status, 403);

  const ownerRemove = await request(`/api/batch/${batchId}/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${owner.token}`,
    },
  });

  assert.equal(ownerRemove.status, 200);
  assert.equal(ownerRemove.body.data.items.length, 0);
});

test("expired or closed batches cannot be edited", async () => {
  const owner = await registerUser({
    name: "Owner",
    email: "owner@example.com",
  });

  const expiredBatchResponse = await createBatch(owner.token, {
    expiresAt: new Date(Date.now() + 1000).toISOString(),
  });
  const expiredBatchId = expiredBatchResponse.body.data._id;

  await new Promise((resolve) => setTimeout(resolve, 1100));

  const expiredAdd = await request(`/api/batch/${expiredBatchId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${owner.token}`,
    },
    body: JSON.stringify({
      name: "Late fries",
      quantity: 1,
      price: 40,
    }),
  });

  assert.equal(expiredAdd.status, 400);

  const openBatchResponse = await createBatch(owner.token);
  const closedBatchId = openBatchResponse.body.data._id;

  const closeResponse = await request(`/api/batch/${closedBatchId}/close`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${owner.token}`,
    },
  });

  assert.equal(closeResponse.status, 200);

  const closedAdd = await request(`/api/batch/${closedBatchId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${owner.token}`,
    },
    body: JSON.stringify({
      name: "After-hours drink",
      quantity: 1,
      price: 50,
    }),
  });

  assert.equal(closedAdd.status, 400);
});
