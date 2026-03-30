const dotenv = require("dotenv");

dotenv.config();

const http = require("http");
const app = require("./app");
const { connectDB } = require("./config/db");
const { HOST, PORT } = require("./config/env");
const { initSocket } = require("./socket/socket");

const startServer = async ({ host = HOST, port = PORT } = {}) => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, host, resolve);
  });

  const address = server.address();
  const printablePort =
    typeof address === "object" && address ? address.port : port;

  console.log(`Server running on http://${host}:${printablePort}`);

  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
}

module.exports = {
  startServer,
};
