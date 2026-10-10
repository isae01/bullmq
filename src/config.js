const IORedis = require("ioredis");

const queueName = "cola-correos";

// Crea una conexión independiente con Redis.
function createRedisConnection() {
  const connection = new IORedis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6380),
    maxRetriesPerRequest: null,
  });

  connection.on("error", (error) => {
    console.error("Error de conexión con Redis:", error.message);
  });

  return connection;
}

module.exports = {
  queueName,
  createRedisConnection,
};
