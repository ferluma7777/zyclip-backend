const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Memoria temporal (se pierde si Cloud Run reinicia)
const jobs = {};

// Health
app.get("/health", (req, res) => {
  res.json({ ok: true, service: "zyclip-api", time: new Date().toISOString() });
});

// Home
app.get("/", (req, res) => {
  res.send("Zyclip API funcionando 🚀");
});

// Ping
app.get("/ping", (req, res) => {
  res.json({ ok: true, message: "pong", time: new Date().toISOString() });
});

// Crear job
app.post("/create-job", (req, res) => {
  const body = req.body || {};
  const videoUrl = body.videoUrl;
  const platform = body.platform;

  if (!videoUrl || !platform) {
    return res.status(400).json({
      ok: false,
      error: "Faltan datos: videoUrl y platform son obligatorios",
      example: { videoUrl: "https://...", platform: "tiktok" },
    });
  }

  const jobId = Date.now().toString();

  jobs[jobId] = {
    jobId,
    videoUrl,
    platform,
    status: "queued",
    createdAt: new Date().toISOString(),
  };

  // Simulación de estados
  setTimeout(() => {
    if (jobs[jobId]) jobs[jobId].status = "processing";
  }, 3000);

  setTimeout(() => {
    if (jobs[jobId]) {
      jobs[jobId].status = "completed";
      jobs[jobId].updatedAt = new Date().toISOString();
      jobs[jobId].clips = [
        { id: "clip1", title: "Clip 1", url: "https://example.com/clip1.mp4" },
        { id: "clip2", title: "Clip 2", url: "https://example.com/clip2.mp4" },
        { id: "clip3", title: "Clip 3", url: "https://example.com/clip3.mp4" },
      ];
    }
  }, 8000);

  return res.json({ ok: true, jobId, status: "queued" });
});

// Ver job
app.get("/job/:id", (req, res) => {
  const job = jobs[req.params.id];
  if (!job) return res.status(404).json({ ok: false, error: "Job no encontrado" });
  res.json({ ok: true, ...job });
});

// ✅ Cloud Run: SIEMPRE usar process.env.PORT (normalmente 8080)
const PORT = Number(process.env.PORT) || 8080;

// ✅ Escuchar en 0.0.0.0 para que sea accesible desde fuera (Cloud Run)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Zyclip API corriendo en puerto ${PORT}`);
});
