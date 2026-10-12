const CAPS = [
  {
    tag: "end-to-end",
    title: "I own the whole stack",
    body: "Database design, backend logic, frontend, and deployment — I don't hand off between stages, I carry a system from spec to production.",
  },
  {
    tag: "self-serve",
    title: "I build the admin tools too",
    body: "Every site I ship comes with a panel so the team that owns it can update products, content, and bookings without needing me for every change.",
  },
  {
    tag: "inherited code",
    title: "I'm comfortable fixing what I didn't build",
    body: "The clock-in and payroll system was written by past developers — I diagnosed its recurring bugs and rebuilt its configuration logic to match how the company actually works.",
  },
  {
    tag: "security-minded",
    title: "I check for what's exposed",
    body: "My endpoint testing on eLesen Kemaman found unsecured pages before they became a problem — I read code with an eye for what could break or be abused.",
  },
];

export default function HowIWork() {
  return (
    <section id="how">
      <div className="section-head">
        <h2>How I work</h2>
        <p>What being the only developer on most of these projects has taught me.</p>
      </div>
      <div className="cap-grid">
        {CAPS.map((c) => (
          <div className="cap" key={c.title}>
            <span className="num">{c.tag}</span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
