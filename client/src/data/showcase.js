// Everything the /projects stage and the per-project pages show.
//
// ORDER HERE = ORDER ON THE PAGE (Alphard, AS Tech, Kaftanasia, Clock-in).
//
// Images live in client/public/<folder>/ and are served from the site root, so
// "alphard/homepage_alphard.png" is requested as "/alphard/homepage_alphard.png".
// The FIRST image of each project must be its homepage - it is used as the card
// on the stage, the big picture on the project page, and the background of the
// "next project" banner. Add or remove screenshots by editing `images`; the
// gallery layout adapts (it cycles through a set of size/position patterns).
//
// `slug` doubles as the project id used by the home page tiles (api.js), so the
// tiles can link straight to /projects/<slug>.

const GRADIENTS = {
  live: "linear-gradient(135deg, #163A6B 0%, #2F6FED 100%)",
  built: "linear-gradient(135deg, #1B2A44 0%, #4A6FA8 100%)",
  inherited: "linear-gradient(135deg, #0B1220 0%, #29406E 100%)",
};

export const SHOWCASE = [
  {
    slug: "alphard-chauffeur",
    name: "Alphard Chauffeur",
    status: "built",
    statusLabel: "built, pending launch",
    blurb: "A booking system for a chauffeur service, with an admin panel for rides and schedules.",
    description:
      "A booking system for the group's upcoming chauffeur service, with a customer-facing booking flow and an admin panel for managing rides and schedules. Built solo, XAMPP for local dev, awaiting company launch.",
    role: "Sole developer: frontend, backend, admin panel",
    category: ["Booking system"],
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    link: null,
    folder: "alphard",
    images: [
      { file: "homepage_alphard.png", label: "Homepage" },
      { file: "homepage2_alphard.png", label: "Homepage, continued" },
      { file: "content_alphard.png", label: "Service content" },
      { file: "content2_alphard.png", label: "Service content, continued" },
      { file: "wedding_alphard.png", label: "Wedding chauffeur page" },
      { file: "contact_alphard.png", label: "Contact page" },
      { file: "privacy_alphard.png", label: "Privacy policy" },
      { file: "admin_alphard.png", label: "Admin panel" },
    ],
  },
  {
    slug: "as-tech",
    name: "AS Tech",
    status: "built",
    statusLabel: "built, pending launch",
    blurb: "An e-commerce platform for laptops, hardware and services, with its own admin panel.",
    description:
      "An e-commerce platform for the group's laptop, hardware, and services brand, complete with its own admin panel for managing products and orders. Built solo and currently in final testing before deployment.",
    role: "Sole developer: frontend, backend, admin panel",
    category: ["E-commerce"],
    stack: ["HTML", "CSS", "JavaScript", "PHP"],
    link: null,
    folder: "astech",
    images: [
      { file: "homepage_astech.png", label: "Homepage" },
      { file: "homepage2_astech.png", label: "Homepage, continued" },
      { file: "product_astech.png", label: "Product page" },
      { file: "custompc_astech.png", label: "Custom PC page" },
      { file: "cart_astech.png", label: "Cart" },
      { file: "account_astech.png", label: "Customer account" },
      { file: "contact_astech.png", label: "Contact page" },
      { file: "admin_astech.png", label: "Admin panel" },
    ],
  },
  {
    slug: "kaftanasia",
    name: "Kaftanasia",
    status: "live",
    statusLabel: "live at kaftanasia.com",
    blurb: "The online store for a kaftan fashion label: catalogue, cart, checkout and an admin panel.",
    description:
      "A full online store for the group's kaftan fashion label, with a product catalogue, cart and checkout, plus an admin panel the marketing team runs day to day without needing a developer. Visual direction was set by the client; I owned the entire technical build.",
    role: "Sole developer: frontend, backend, admin panel, deployment",
    category: ["E-commerce"],
    stack: ["HTML", "CSS", "JavaScript", "PHP", "Hostinger"],
    link: "https://kaftanasia.com",
    folder: "kaftan",
    images: [
      { file: "homepage_kaftan.png", label: "Homepage" },
      { file: "homepage2_kaftan.png", label: "Homepage, continued" },
      { file: "product_kaftan.png", label: "Product page" },
      { file: "size_kaftan.png", label: "Size guide" },
      { file: "about_kaftan.png", label: "About page" },
      { file: "contact_kaftan.png", label: "Contact page" },
      { file: "admin_kaftan.png", label: "Admin panel" },
      { file: "admin2_kaftan.png", label: "Admin panel, continued" },
    ],
  },
  {
    slug: "clockin-payroll",
    name: "Clock-in & Payroll",
    status: "inherited",
    statusLabel: "inherited, in production",
    blurb: "An attendance and payroll tool I inherited, then maintained and improved to match company policy.",
    description:
      "An internal employee attendance and payroll tool originally built by past developers, handed to me to maintain. Resolved recurring bugs and improved the working-hour and salary-configuration logic, admin panel, and automated salary generation to match the company's actual policies.",
    role: "Maintainer: bug fixes, config logic, admin panel",
    category: ["Attendance & payroll"],
    stack: ["PHP", "MySQL"],
    link: null,
    linkNote: "Internal company tool · running in production at AS Tech Legacy Group",
    // Screenshots live in client/public/clockin/.
    folder: "clockin",
    images: [
      { file: "user_clockin.png", label: "Employee dashboard" },
      { file: "cuti_clockin.png", label: "Leave (cuti)" },
      { file: "ot_clockin.png", label: "Overtime" },
      { file: "rekod_clockin.png", label: "Attendance records" },
      { file: "admin_clockin.png", label: "Admin panel" },
      { file: "workhour_clockin.png", label: "Working-hour settings" },
      { file: "salaryconfig_clockin.png", label: "Salary configuration" },
      { file: "salaryrecords_clockin.png", label: "Salary records" },
    ],
  },
].map((p) => ({ ...p, gradient: GRADIENTS[p.status] || GRADIENTS.built }));

export function getProject(slug) {
  return SHOWCASE.find((p) => p.slug === slug) || null;
}

export function imageUrl(project, image) {
  return `/${project.folder}/${image.file}`;
}

// The homepage screenshot (first image), or null if the project has none yet.
export function coverOf(project) {
  return project.images.length ? imageUrl(project, project.images[0]) : null;
}