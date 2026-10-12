import { Router } from "express";
import { Resend } from "resend";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "..", "data", "contact-submissions.json");
const LIMITS = { name: 100, email: 200, message: 5000 };

const router = Router();

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Local backup of every submission while testing on your own machine.
async function logSubmission(entry) {
  let existing = [];
  try {
    existing = JSON.parse(await fs.readFile(LOG_FILE, "utf-8"));
  } catch {
    // file doesn't exist yet - that's fine
  }
  existing.push(entry);
  await fs.writeFile(LOG_FILE, JSON.stringify(existing, null, 2));
}

router.post("/", async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim();
  const message = String(req.body?.message ?? "").trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are all required." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid email address." });
  }
  if (name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message) {
    return res.status(400).json({ error: "Your message is too long. Please shorten it and try again." });
  }

  // Spam checks: a filled-in hidden field, or a form sent within 3 seconds of opening
  // the page, is almost certainly a bot. Pretend it worked so the bot doesn't retry.
  const elapsedMs = Number(req.body?.elapsedMs);
  if (String(req.body?.website ?? "").trim() !== "" || !Number.isFinite(elapsedMs) || elapsedMs < 3000) {
    return res.status(200).json({ ok: true });
  }

  try {
    await logSubmission({ name, email, message, receivedAt: new Date().toISOString() });
  } catch (err) {
    console.error("Failed to log contact submission:", err);
  }

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
    console.warn("RESEND_API_KEY / CONTACT_TO_EMAIL not set - submission saved to disk only.");
    return res.json({ ok: true, delivered: false });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const safeName = name.replace(/[\r\n]+/g, " ");

  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || "Portfolio Contact <onboarding@resend.dev>",
    to: process.env.CONTACT_TO_EMAIL,
    replyTo: email,
    subject: `New portfolio message from ${safeName}`,
    text: `From: ${safeName} <${email}>\nSent: ${new Date().toISOString()}\n\n${message}`,
  });

  if (error) {
    console.error("Resend error:", error);
    return res.status(502).json({ error: "Your message couldn't be sent right now. Please email me directly instead." });
  }

  res.json({ ok: true, delivered: true });
});

export default router;
