import { EDUCATION } from "../data/about.js";

// A compact "Education" line that sits under the Experience title, so the About
// page doesn't need a section of its own for it.
export default function EduLine() {
  return (
    <div className="ab-edu-line">
      <span className="ab-edu-lbl">Education</span>
      <ul>
        {EDUCATION.map((e) => (
          <li className="ab-edu-pill" key={e.title}>
            <b>{e.title}</b>
            <i>{e.place} · {e.date}</i>
          </li>
        ))}
      </ul>
    </div>
  );
}