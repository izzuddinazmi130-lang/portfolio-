// Local dev: talks to the Express server on :4000.
// On Vercel: same site, so "/api/..." hits the serverless functions in client/api.
const API_BASE = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:4000" : "");

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/api/projects`);
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

export async function sendContactMessage(payload) {
  const res = await fetch(`${API_BASE}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to send message");
  return data;
}

// Shown immediately while the API call is in flight, and used as a fallback
// if the backend isn't running (e.g. viewing the built site without the API deployed).
export const FALLBACK_PROJECTS = [
  {
    id: "kaftanasia",
    name: "Kaftanasia",
    status: "live",
    statusLabel: "live at kaftanasia.com",
    description:
      "A full online store for the group's kaftan fashion label, with a product catalogue, cart and checkout, plus an admin panel the marketing team runs day to day without needing a developer. Visual direction was set by the client; I owned the entire technical build.",
    role: "Sole developer: frontend, backend, admin panel, deployment",
    stack: ["HTML", "CSS", "JavaScript", "PHP", "Hostinger"],
    link: "https://kaftanasia.com",
  },
  {
    id: "as-tech",
    name: "AS Tech",
    status: "built",
    statusLabel: "built, pending launch",
    description:
      "An e-commerce platform for the group's laptop, hardware, and services brand, complete with its own admin panel for managing products and orders. Built solo and currently in final testing before deployment.",
    role: "Sole developer: frontend, backend, admin panel",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    link: null,
  },
  {
    id: "alphard-chauffeur",
    name: "Alphard Chauffeur",
    status: "built",
    statusLabel: "built, pending launch",
    description:
      "A booking system for the group's upcoming chauffeur service, with a customer-facing booking flow and an admin panel for managing rides and schedules. Built solo, XAMPP for local dev, awaiting company launch.",
    role: "Sole developer: frontend, backend, admin panel",
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    link: null,
  },
  {
    id: "clockin-payroll",
    name: "Clock-in & Payroll System",
    status: "inherited",
    statusLabel: "inherited, in production",
    description:
      "An internal employee attendance and payroll tool originally built by past developers, handed to me to maintain. Resolved recurring bugs and rebuilt the working-hour and salary-configuration logic, admin panel, and automated salary generation to match the company's actual policies.",
    role: "Maintainer: bug fixes, config logic, admin panel",
    stack: ["PHP", "MySQL"],
    link: null,
  },
];