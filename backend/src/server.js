const dotenv = require("dotenv");
const http = require("http");
const connectDB = require("./config/db");
const app = require("./app");
const { initSocket } = require("./socket/socket");

dotenv.config();

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  initSocket(server);

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use.\nPlease stop the other process or set a different PORT value.`
      );
      process.exit(1);
    } else {
      console.error("Server error:", err);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
