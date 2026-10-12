const LANGUAGES = ["PHP", "Laravel", "Inertia.js", "JavaScript", "React", "Node.js", "HTML", "CSS", "C++", "Java", "Python"];
const TOOLS = ["MySQL", "XAMPP", "Hostinger", "Git", "Visual Studio Code"];

export default function Skills() {
  return (
    <section id="skills">
      <div className="section-head">
        <h2>Skills</h2>
        <p>Tools I reach for when building and shipping a system.</p>
      </div>
      <div className="skills-wrap">
        <div className="skill-group">
          <h4>languages &amp; frameworks</h4>
          <div className="skill-tags">
            {LANGUAGES.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="skill-group">
          <h4>tools &amp; environments</h4>
          <div className="skill-tags">
            {TOOLS.map((s) => (
              <span className="tag" key={s}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
