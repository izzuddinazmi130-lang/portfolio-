const TIMELINE = [
  { date: "Apr 2026 — Present", role: "Fullstack Programmer, Marketing Department", org: "AS Legacy Group — AS Tech / Kaftanasia / Alphard Chauffeur" },
  { date: "Sep — Dec 2025", role: "Customer Service Professional", org: "Telekom Malaysia — Budi Madani Contact Centre", secondary: true },
  { date: "Aug 2025", role: "Graphic Designer", org: "WrapArt Studio Sdn. Bhd", secondary: true },
  { date: "Sep 2024 — Jan 2025", role: "Intern Software Developer", org: "MySoftcare Solution — Laravel & Inertia.js" },
  { date: "Mar — Sep 2022", role: "Technical Support & Sales", org: "Aidea Technology, Kuala Terengganu" },
];

export default function Experience() {
  return (
    <section id="experience">
      <div className="section-head">
        <h2>Experience</h2>
        <p>Bachelor of Science, Computer &amp; Mathematics — UiTM (2022–2024)</p>
      </div>
      <div>
        {TIMELINE.map((t) => (
          <div className={`tl-item ${t.secondary ? "tl-item-secondary" : ""}`} key={t.role}>
            <div className="tl-date">{t.date}</div>
            <div>
              <div className="tl-role">{t.role}</div>
              <div className="tl-org">{t.org}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
