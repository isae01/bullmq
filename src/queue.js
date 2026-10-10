const { Queue } = require("bullmq");
const { queueName, createRedisConnection } = require("./config");

// Esta cola será utilizada por la API para agregar trabajos.
const emailQueue = new Queue(queueName, {
  connection: createRedisConnection(),
});

module.exports = { emailQueue };
