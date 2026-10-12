import { useState } from "react";
import { EXPERTISE } from "../data/about.js";

// Text-only. Desktop: hover/focus a row and the big panel on the right swaps to
// it. Phones: each row is an accordion that opens its own description.
export default function Expertise() {
  const [active, setActive] = useState(0);
  const [openMobile, setOpenMobile] = useState(0);
  const current = EXPERTISE[active];
  const num = (i) => String(i + 1).padStart(2, "0");

  function choose(i, isOpen) {
    setActive(i);
    setOpenMobile(isOpen ? -1 : i);
  }

  return (
    <section id="expertise">
      <div className="section-head">
        <h2>My expertise</h2>
        <p>What I&apos;m good at, in plain words.</p>
      </div>

      <div className="xp">
        <div className="xp-list">
          {EXPERTISE.map((item, i) => {
            const isOpen = openMobile === i;
            return (
              <div className={`xp-item ${active === i ? "active" : ""} ${isOpen ? "open" : ""}`} key={item.title}>
                <div
                  className="xp-row"
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => choose(i, isOpen)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      choose(i, isOpen);
                    }
                  }}
                >
                  <span className="xp-num">{num(i)}</span>
                  <span className="xp-title">{item.title}</span>
                  <span className="xp-plus" aria-hidden="true"></span>
                </div>
                <div className="xp-inline">
                  <div className="xp-inline-inner">
                    <b className="xp-punch">{item.punch}</b>
                    <p>{item.text}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="xp-panel" aria-live="polite">
          <div className="xp-panel-inner" key={active}>
            <span className="xp-big" aria-hidden="true">{num(active)}</span>
            <h3>{current.title}</h3>
            <b className="xp-punch">{current.punch}</b>
            <p>{current.text}</p>
            <div className="xp-meter" aria-hidden="true">
              {EXPERTISE.map((_, i) => (
                <i key={i} className={i === active ? "on" : ""}></i>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}