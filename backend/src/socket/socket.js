const { Server } = require("socket.io");

let ioInstance = null;

const getBatchRoom = (batchId) => `batch:${batchId}`;

const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
  });

  ioInstance.on("connection", (socket) => {
    socket.on("batch:join", (batchId) => {
      if (batchId) {
        socket.join(getBatchRoom(batchId));
      }
    });

    socket.on("batch:leave", (batchId) => {
      if (batchId) {
        socket.leave(getBatchRoom(batchId));
      }
    });
  });

  return ioInstance;
};

const emitBatchUpdated = (batch, eventType = "updated") => {
  if (!ioInstance || !batch) {
    return;
  }

  const batchId = batch._id?.toString?.() || batch._id;
  const payload = {
    eventType,
    batchId,
    batch,
  };

  ioInstance.to(getBatchRoom(batchId)).emit("batch:updated", payload);
  ioInstance.emit("batches:changed", payload);
};

module.exports = {
  emitBatchUpdated,
  initSocket,
};
