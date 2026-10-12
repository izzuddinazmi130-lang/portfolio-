import "dotenv/config";
import express from "express";
import cors from "cors";
import projectsRouter from "./routes/projects.js";
import contactRouter from "./routes/contact.js";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim());

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/projects", projectsRouter);
app.use("/api/contact", contactRouter);

app.listen(PORT, () => {
  console.log(`Portfolio API running on http://localhost:${PORT}`);
});
