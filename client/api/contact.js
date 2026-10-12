// Vercel serverless function: POST /api/contact
// Emails every contact-form submission to you through Resend.
import { Resend } from "resend";

const LIMITS = { name: 100, email: 200, message: 5000 };

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

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

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
    console.error("RESEND_API_KEY or CONTACT_TO_EMAIL is not set.");
    return res.status(500).json({ error: "The contact form isn't set up yet. Please email me directly instead." });
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

  return res.status(200).json({ ok: true });
}
