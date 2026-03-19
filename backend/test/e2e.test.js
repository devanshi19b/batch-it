const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.MONGO_URI = "";

const app = require("../src/app");
const { resetMemoryStore } = require("../src/data/memoryStore");

let server;
let baseUrl;

const request = async (pathname, options = {}) => {
  const headers = { ...(options.headers || {}) };
  let body = options.body;

  if (body && typeof body !== "string") {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    ...options,
    headers,
    body,
  });

  let payload = null;
  const text = await response.text();

  if (text) {
    payload = JSON.parse(text);
  }

  return {
    status: response.status,
    body: payload,
  };
};

test.before(async () => {
  server = http.createServer(app);

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const { port } = server.address();
  baseUrl = `http://127.0.0.1:${port}`;
});

test.beforeEach(() => {
  resetMemoryStore();
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
});

test("health, root, tasks, and 404 routes respond cleanly", async () => {
  const [health, root, tasks, missing] = await Promise.all([
    request("/health"),
    request("/"),
    request("/api/tasks"),
    request("/does-not-exist"),
  ]);

  assert.equal(health.status, 200);
  assert.equal(health.body.status, "OK");

  assert.equal(root.status, 200);
  assert.equal(root.body.success, true);

  assert.equal(tasks.status, 200);
  assert.deepEqual(tasks.body.data, []);

  assert.equal(missing.status, 404);
  assert.match(missing.body.message, /Route not found/);
});

test("auth flow validates input, registers users, and logs in", async () => {
  const invalidRegister = await request("/api/auth/register", {
    method: "POST",
    body: { email: "bad-email", password: "123" },
  });

  assert.equal(invalidRegister.status, 400);

  const register = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Devanshi",
      email: "Devanshi@example.com",
      password: "strongpass",
    },
  });

  assert.equal(register.status, 201);
  assert.equal(register.body.user.email, "devanshi@example.com");
  assert.ok(register.body.token);
  assert.equal(register.body.user.password, undefined);

  const duplicate = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Devanshi",
      email: "devanshi@example.com",
      password: "strongpass",
    },
  });

  assert.equal(duplicate.status, 409);

  const badLogin = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: "devanshi@example.com",
      password: "wrongpass",
    },
  });

  assert.equal(badLogin.status, 401);

  const login = await request("/api/auth/login", {
    method: "POST",
    body: {
      email: "devanshi@example.com",
      password: "strongpass",
    },
  });

  assert.equal(login.status, 200);
  assert.ok(login.body.token);
  assert.equal(login.body.user.name, "Devanshi");
});

test("batch routes work end to end through both route prefixes", async () => {
  const register = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "Batch Owner",
      email: "owner@example.com",
      password: "strongpass",
    },
  });
  const token = register.body.token;

  const unauthorizedCreate = await request("/api/batch/create", {
    method: "POST",
    body: {
      buildingId: "A-1",
      restaurantName: "Wrap House",
      expiresAt: "2026-04-01T12:00:00.000Z",
    },
  });

  assert.equal(unauthorizedCreate.status, 401);

  const create = await request("/api/batch/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      buildingId: "A-1",
      restaurantName: "Wrap House",
      expiresAt: "2026-04-01T12:00:00.000Z",
      items: [
        {
          name: "Veg Roll",
          quantity: 2,
          price: 120,
        },
      ],
    },
  });

  assert.equal(create.status, 201);
  assert.equal(create.body.data.status, "LIVE");
  assert.equal(create.body.data.items.length, 1);

  const batchId = create.body.data._id;

  const getAll = await request("/api/batches");
  assert.equal(getAll.status, 200);
  assert.equal(getAll.body.count, 1);

  const getById = await request(`/api/batch/${batchId}`);
  assert.equal(getById.status, 200);
  assert.equal(getById.body.data.restaurantName, "Wrap House");

  const summaryBefore = await request(`/api/batch/${batchId}/summary`);
  assert.equal(summaryBefore.status, 200);
  assert.equal(summaryBefore.body.totalItems, 2);
  assert.equal(summaryBefore.body.totalAmount, 240);

  const addItem = await request(`/api/batches/${batchId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      name: "Paneer Roll",
      quantity: 1,
      price: 150,
    },
  });

  assert.equal(addItem.status, 200);
  assert.equal(addItem.body.data.items.length, 2);

  const addedItemId = addItem.body.data.items.find(
    (item) => item.name === "Paneer Roll"
  )._id;

  const summaryAfterAdd = await request(`/api/batch/${batchId}/summary`);
  assert.equal(summaryAfterAdd.status, 200);
  assert.equal(summaryAfterAdd.body.totalItems, 3);
  assert.equal(summaryAfterAdd.body.totalAmount, 390);

  const removeItem = await request(`/api/batch/${batchId}/items/${addedItemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(removeItem.status, 200);
  assert.equal(removeItem.body.data.items.length, 1);

  const close = await request(`/api/batches/${batchId}/close`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(close.status, 200);
  assert.equal(close.body.data.status, "CLOSED");

  const addAfterClose = await request(`/api/batch/${batchId}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: {
      name: "Should Fail",
      quantity: 1,
      price: 99,
    },
  });

  assert.equal(addAfterClose.status, 400);
});

test("malformed batch ids return clean 404 responses", async () => {
  const register = await request("/api/auth/register", {
    method: "POST",
    body: {
      name: "ID Tester",
      email: "ids@example.com",
      password: "strongpass",
    },
  });
  const token = register.body.token;

  const [getById, addItem, closeBatch] = await Promise.all([
    request("/api/batch/not-a-real-id"),
    request("/api/batch/not-a-real-id/items", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: {
        name: "Sample",
        quantity: 1,
        price: 10,
      },
    }),
    request("/api/batches/not-a-real-id/close", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  ]);

  assert.equal(getById.status, 404);
  assert.equal(addItem.status, 404);
  assert.equal(closeBatch.status, 404);
});
