const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocket } = require("./socket/socket");

dotenv.config();

const PORT = Number(process.env.PORT) || 5050;
const HOST = process.env.HOST || "127.0.0.1";

const logListenError = (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use on ${HOST}.\nPlease stop the other process or set a different PORT value.`
    );
    return;
  }

  if (err.code === "EPERM") {
    console.error(
      `The server could not bind to ${HOST}:${PORT}.\nTry using a different HOST/PORT value, or run the server in an environment that allows local port binding.`
    );
    return;
  }

  console.error("Server error:", err);
};

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.on("error", (err) => {
    logListenError(err);
    process.exit(1);
  });

  server.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
