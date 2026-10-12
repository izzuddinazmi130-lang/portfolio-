// Content for the About page (/about) and the homepage "My expertise" section.
// Screenshots are borrowed from the project folders (see showcase.js), so a
// card can show the real work that proves the claim. { slug, file } must match
// a project slug and one of its image file names; leave `shot` out for a card
// that has no screenshot (it gets a coloured note card instead).
import { getProject, imageUrl } from "./showcase.js";

export function shotUrl(shot) {
  if (!shot) return null;
  const project = getProject(shot.slug);
  const image = project && project.images.find((i) => i.file === shot.file);
  return project && image ? imageUrl(project, image) : null;
}

export const CAPS = [
  {
    tag: "end-to-end",
    title: "I own the whole stack",
    body: "Database design, backend logic, frontend, and deployment — I don't hand off between stages, I carry a system from spec to production. I'm building three sites this way on my own: Kaftanasia, Alphard Chauffeur and AS Tech.",
    shots: [
      { slug: "kaftanasia", file: "homepage_kaftan.png", label: "Kaftanasia" },
      { slug: "alphard-chauffeur", file: "homepage_alphard.png", label: "Alphard Chauffeur" },
      { slug: "as-tech", file: "homepage_astech.png", label: "AS Tech" },
    ],
    href: "/projects",
    cta: "See all projects",
  },
  {
    tag: "self-serve",
    title: "I build the admin tools too",
    body: "Every site I ship comes with a panel so the team that owns it can update products, content, and bookings without needing me for every change. All three of my sites have an admin panel of their own.",
    shots: [
      { slug: "kaftanasia", file: "admin_kaftan.png", label: "Kaftanasia — admin panel" },
      { slug: "alphard-chauffeur", file: "admin_alphard.png", label: "Alphard Chauffeur — admin panel" },
      { slug: "as-tech", file: "admin_astech.png", label: "AS Tech — admin panel" },
    ],
    href: "/projects",
    cta: "See all projects",
  },
  {
    tag: "inherited code",
    title: "I'm comfortable fixing what I didn't build",
    body: "The clock-in and payroll system was written by past developers. I maintain it: I tracked down its recurring bugs and improved its working-hour rules, salary configuration and automated salary generation to match how the company actually works.",
    footnote: { text: "One system, already in production — these are the parts I maintained and improved." },
    shots: [
      { slug: "clockin-payroll", file: "admin_clockin.png", label: "Clock-in — admin panel", badge: "Maintained & improved" },
      { slug: "clockin-payroll", file: "workhour_clockin.png", label: "Clock-in — working-hour rules", badge: "Maintained & improved" },
      { slug: "clockin-payroll", file: "salaryconfig_clockin.png", label: "Clock-in — salary configuration", badge: "Maintained & improved" },
    ],
    href: "/projects/clockin-payroll",
    cta: "See the project",
  },
  {
    tag: "security-minded",
    title: "I check for what's exposed",
    body: "My endpoint testing on eLesen Kemaman found unsecured pages before they became a problem — I read code with an eye for what could break or be abused.",
    shots: [
      { src: "/elesen/sample.png", file: "elesen-sample.png", label: "eLesen Kemaman — homepage" },
    ],
    // The screenshot shows the site; the steps show what I actually did to it.
    flow: [
      { step: "Test", text: "Brute-force the endpoints" },
      { step: "Find", text: "Surface the unsecured pages" },
      { step: "Fix", text: "Deliver a breach report with fixes" },
    ],
    flowTitle: "How the audit went",
  },
];

export const TIMELINE = [
  { date: "Apr 2026 — Present", role: "Full-Stack Programmer, Marketing Department", org: "AS Tech Legacy Group — AS Tech / Kaftanasia / Alphard Chauffeur", img: "/experience/astech.jpeg", place: "AS Tech Legacy Group", desc: "Sole in-house programmer for three company brands. I built Kaftanasia (live), AS Tech and Alphard Chauffeur end to end, each with its own admin panel. I also maintain the clock-in and payroll system and mentor an intern." },
  { date: "Sep — Dec 2025", role: "Customer Service Professional", org: "Telekom Malaysia — Budi Madani Contact Centre", secondary: true, img: "/experience/tm.jpeg", place: "Telekom Malaysia", desc: "Handled inbound calls and live chat for the Budi Madani RON95 subsidy programme, solving application, eligibility and login issues in the CRM while keeping my KPIs up under heavy volume." },
  { date: "Aug 2025", role: "Graphic Designer", org: "WrapArt Studio Sdn. Bhd", secondary: true, img: "/experience/wrapart.jpeg", place: "WrapArt Studio", desc: "Designed car-wrap mockups and branding in Illustrator and Photoshop, and prepared print-ready, large-format artwork for clients while juggling several requests on tight deadlines." },
  { date: "Sep 2024 — Jan 2025", role: "Intern Software Developer", org: "MySoftcare Solution — Laravel & Inertia.js", img: "/experience/mysoftcare.jpeg", place: "MySoftcare Solution", desc: "Built a full-stack project management app in Laravel and Inertia.js: dashboard, task assignment, role-based access, CRUD and database design. I also security-tested the eLesen Kemaman site and wrote a breach report." },
  { date: "Mar — Sep 2022", role: "IT Support Technician", org: "Aidea Technology, Kuala Terengganu", img: "/experience/aidea.jpeg", place: "Aidea Technology", desc: "Fixed hardware and software problems on customers' laptops and printers, set up PCs, printers and CCTV on site, and handled upgrades like RAM, SSD and battery replacements." },
];

export const LANGUAGES = ["PHP", "Laravel", "Inertia.js", "JavaScript", "React", "Node.js", "HTML", "CSS", "C++", "Java", "Python"];
export const TOOLS = ["MySQL", "XAMPP", "Hostinger", "Git", "Visual Studio Code", "CRM systems", "Adobe Illustrator", "Adobe Photoshop"];

export const EDUCATION = [
  { date: "2022 — 2024", title: "Bachelor of Computer Science & Mathematics (Hons)", place: "UiTM" },
  { date: "2020 — 2022", title: "Diploma in Computer Science", place: "UiTM" },
];

// Homepage "My expertise" - text only: a title, a punchline and a short description.
export const EXPERTISE = [
  {
    title: "Full-stack web systems",
    punch: "Spec to production, one pair of hands.",
    text: "Database, backend logic, interface and deployment. I carry a system from the first idea all the way to a live site, without handing it off in between.",
  },
  {
    title: "Admin panels & dashboards",
    punch: "So the team never has to wait on me.",
    text: "The people who run the site manage products, content and bookings themselves, from a panel built around how they actually work.",
  },
  {
    title: "E-commerce & booking flows",
    punch: "Easy for customers to finish.",
    text: "Product catalogues, carts and checkout, plus ride-booking journeys that stay simple from the first click to the confirmation.",
  },
  {
    title: "Payroll & attendance logic",
    punch: "Rules that match real policy.",
    text: "Working-hour rules, salary configuration and automated salary generation, improved so the system does what the company actually does.",
  },
  {
    title: "Security testing & bug hunting",
    punch: "I read code for what could break.",
    text: "Brute-force endpoint testing that surfaces unsecured pages, followed by a clear breach report with fixes, and a habit of chasing bugs to their root.",
  },
];