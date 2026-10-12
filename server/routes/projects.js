import { Router } from "express";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { requireAdmin } from "../middleware/adminAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "data", "projects.json");

async function readProjects() {
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw);
}
async function writeProjects(projects) {
  await fs.writeFile(DATA_FILE, JSON.stringify(projects, null, 2));
}

const router = Router();

// GET /api/projects - public, used by the portfolio homepage
router.get("/", async (req, res) => {
  try {
    const projects = await readProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Could not load projects." });
  }
});

// POST /api/projects - add a new project. Requires x-admin-token header.
router.post("/", requireAdmin, async (req, res) => {
  const { id, name, status, statusLabel, description, role, stack, link } = req.body;
  if (!id || !name || !description) {
    return res.status(400).json({ error: "id, name, and description are required." });
  }
  try {
    const projects = await readProjects();
    if (projects.some((p) => p.id === id)) {
      return res.status(409).json({ error: `A project with id "${id}" already exists.` });
    }
    const newProject = { id, name, status: status || "built", statusLabel: statusLabel || "", description, role: role || "", stack: stack || [], link: link || null };
    projects.push(newProject);
    await writeProjects(projects);
    res.status(201).json(newProject);
  } catch (err) {
    res.status(500).json({ error: "Could not save project." });
  }
});

// PUT /api/projects/:id - update an existing project. Requires x-admin-token header.
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const projects = await readProjects();
    const index = projects.findIndex((p) => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: "Project not found." });
    projects[index] = { ...projects[index], ...req.body, id: projects[index].id };
    await writeProjects(projects);
    res.json(projects[index]);
  } catch (err) {
    res.status(500).json({ error: "Could not update project." });
  }
});

// DELETE /api/projects/:id - remove a project. Requires x-admin-token header.
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const projects = await readProjects();
    const filtered = projects.filter((p) => p.id !== req.params.id);
    if (filtered.length === projects.length) return res.status(404).json({ error: "Project not found." });
    await writeProjects(filtered);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Could not delete project." });
  }
});

export default router;
