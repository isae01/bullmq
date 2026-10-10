require("dotenv").config();
const { Worker } = require("bullmq");
const { queueName, createRedisConnection } = require("./config");

const worker = new Worker(
  queueName,
  async (job) => {
    console.log(`Iniciando trabajo ${job.id}`);
    console.log(`Destinatario: ${job.data.destinatario}`);

    // Simula un envío que tarda cinco segundos.
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Permite comprobar los reintentos si se solicita.
    if (job.data.simularFallo) {
      throw new Error("Fallo simulado durante el envío");
    }

    console.log(`Correo simulado enviado a ${job.data.destinatario}`);

    return {
      enviado: true,
      destinatario: job.data.destinatario,
    };
  },
  {
    connection: createRedisConnection(),
    concurrency: 2,
  },
);

// Se ejecuta cuando un trabajo termina correctamente.
worker.on("completed", (job, result) => {
  console.log(`Trabajo ${job.id} completado correctamente`);
  console.log("Resultado:", result);
});

// Se ejecuta cuando falla un intento de procesamiento.
worker.on("failed", (job, error) => {
  console.error(`Falló un intento del trabajo ${job?.id}: ${error.message}`);
  console.log(`Intentos realizados: ${job?.attemptsMade}`);
});

worker.on("error", (error) => {
  console.error("Error del Worker:", error.message);
});

console.log(`Worker escuchando la cola: ${queueName}`);
