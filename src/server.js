require("dotenv").config();
const express = require("express");
const { emailQueue } = require("./queue");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Ruta para comprobar que la API funciona.
app.get("/", (req, res) => {
  res.json({
    mensaje: "API de trabajos con BullMQ funcionando",
  });
});

// Agrega un correo a la cola sin enviarlo directamente.
app.post("/emails", async (req, res) => {
  const { destinatario, asunto, mensaje, simularFallo = false } = req.body;

  // Comprueba que lleguen los datos necesarios.
  if (!destinatario || !asunto || !mensaje) {
    return res.status(400).json({
      error: "Debes enviar destinatario, asunto y mensaje",
    });
  }

  try {
    // Guarda el trabajo en Redis para que lo procese el Worker.
    const job = await emailQueue.add(
      "enviar-correo",
      {
        destinatario,
        asunto,
        mensaje,
        simularFallo,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );

    // Responde sin esperar a que termine el trabajo.
    return res.status(202).json({
      mensaje: "Trabajo agregado a la cola",
      jobId: job.id,
      estado: "pendiente",
    });
  } catch (error) {
    console.error("Error al agregar el trabajo:", error.message);

    return res.status(500).json({
      error: "No se pudo agregar el trabajo a la cola",
    });
  }
});

app.listen(port, () => {
  console.log(`API ejecutándose en el puerto ${port}`);
});
