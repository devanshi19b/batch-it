const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "batch-it-test-secret";
delete process.env.MONGO_URI;

const { startServer } = require("../src/server");
const { resetStore } = require("../src/utils/memoryStore");

let server;
let baseUrl;

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
});

test("auth and batch flow works end to end", async () => {
  const registerResponse = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      name: "Devanshi",
      email: "devanshi@example.com",
      password: "secret123",
    }),
  });

  assert.equal(registerResponse.status, 201);
  assert.equal(registerResponse.body.success, true);

  const token = registerResponse.body.data.token;
  assert.ok(token);

  const createBatchResponse = await request("/api/batch/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      buildingId: "Tower A",
      restaurantName: "Urban Slice",
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }),
  });

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
