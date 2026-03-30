const PORT = Number(process.env.PORT) || 5050;
const HOST = process.env.HOST || "127.0.0.1";
const MONGO_URI = process.env.MONGO_URI || "";
const JWT_SECRET = process.env.JWT_SECRET || "batch-it-dev-secret";
const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || "7d";

module.exports = {
  PORT,
  HOST,
  MONGO_URI,
  JWT_SECRET,
  TOKEN_EXPIRES_IN,
};
