import { useEffect, useRef, useState } from "react";
import { TIMELINE } from "../data/about.js";
import EduLine from "./EduLine.jsx";

const SCROLL_PER_ENTRY_VH = 70; // how much scrolling each experience gets
const EASE = 0.12;

// Pinned scroll stage for the About page's Experience section. The stage stays
// on screen while the page scrolls; each experience's photo (cropped to fill the
// same frame) slides in as you reach it, and the text follows.
export default function ExperienceStage() {
  const n = TIMELINE.length;
  const wrapRef = useRef(null);
  const slideRefs = useRef([]);
  const rowRefs = useRef([]);
  const fillRef = useRef(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState({});

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let target = 0;
    let shown = 0;
    let raf = null;
    let lastActive = 0;

    function measure() {
      const total = Math.max(1, wrap.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -wrap.getBoundingClientRect().top / total));
      target = p * (n - 1);
    }
    function paint() {
      slideRefs.current.forEach((el, i) => {
        if (!el) return;
        const d = i - shown; // 0 = on screen, +1 = next, -1 = previous
        const a = Math.abs(d);
        el.style.opacity = String(Math.max(0, 1 - a * 1.15).toFixed(3));
        el.style.transform = `translate3d(${(d * 16).toFixed(2)}%,0,0) scale(${(1 - Math.min(a, 1) * 0.07).toFixed(3)})`;
        el.style.visibility = a >= 1 ? "hidden" : "visible";
        el.style.zIndex = a < 0.5 ? 2 : 1;
      });
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${(n > 1 ? shown / (n - 1) : 1).toFixed(4)})`;
      const idx = Math.round(shown);
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }
    }
    function tick() {
      raf = null;
      const diff = target - shown;
      if (Math.abs(diff) < 0.0008) shown = target;
      else shown += diff * EASE;
      paint();
      if (shown !== target) raf = requestAnimationFrame(tick);
    }
    function request() {
      measure();
      if (raf === null) raf = requestAnimationFrame(tick);
    }
    measure();
    shown = target;
    paint();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [n]);

  // Click an entry in the list to scroll straight to it.
  function goTo(i) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const total = wrap.offsetHeight - window.innerHeight;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (n > 1 ? (i / (n - 1)) * total : 0), behavior: "smooth" });
  }

  const current = TIMELINE[active];

  return (
    <div
      className="ab-xp-wrap"
      ref={wrapRef}
      style={{ height: `calc(100svh + ${(n - 1) * SCROLL_PER_ENTRY_VH}vh)` }}
    >
      <div className="ab-xp-stage">
        {/* the section title stays on screen with the stage */}
        <div className="ab-xp-head">
          <span className="ab-no">02</span>
          <h2>Experience</h2>
          <EduLine />
        </div>

        {/* left: the list (laptops / monitors) */}
        <div className="ab-xp-list">
          <div className="ab-xp-line" aria-hidden="true">
            <div className="ab-xp-fill" ref={fillRef}></div>
          </div>
          {TIMELINE.map((t, i) => (
            <div
              key={t.role}
              role="button"
              tabIndex={0}
              ref={(el) => (rowRefs.current[i] = el)}
              className={`ab-xp-row ${i === active ? "active" : ""} ${t.secondary ? "is-secondary" : ""}`}
              onClick={() => goTo(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  goTo(i);
                }
              }}
            >
              <span className="ab-xp-dot" aria-hidden="true"></span>
              <span className="ab-xp-date">{t.date}</span>
              <span className="ab-xp-role">{t.role}</span>
              <span className="ab-xp-org">{t.org}</span>
              <span className="ab-xp-desc">{t.desc}</span>
            </div>
          ))}
        </div>

        {/* right: the photo frame - same size for every entry, photo shown whole */}
        <div className="ab-xp-right">
          <div className="ab-xp-frame">
            {TIMELINE.map((t, i) => (
              <div className="ab-xp-slide" key={t.role} ref={(el) => (slideRefs.current[i] = el)}>
                {t.img && !failed[t.img] ? (
                  <>
                    <img
                      className="ab-xp-img"
                      src={t.img}
                      alt={t.place}
                      loading="lazy"
                      decoding="async"
                      onError={() => setFailed((f) => ({ ...f, [t.img]: true }))}
                    />
                  </>
                ) : (
                  <div className="ab-xp-missing">{t.place}</div>
                )}
              </div>
            ))}
          </div>
          <div className="ab-xp-cap" aria-hidden="true">
            <b>
              {String(active + 1).padStart(2, "0")} <i>/</i> {String(n).padStart(2, "0")}
            </b>
            <span key={active}>{current.place}</span>
          </div>

          {/* phones / tablets: the active entry's text sits under the photo */}
          <div className="ab-xp-now" aria-live="polite">
            <div className="ab-xp-now-inner" key={active}>
              <span className="ab-xp-date">{current.date}</span>
              <span className="ab-xp-role">{current.role}</span>
              <span className="ab-xp-org">{current.org}</span>
              <span className="ab-xp-desc">{current.desc}</span>
            </div>
          </div>
          <p className="ab-xp-hint" aria-hidden="true">Keep scrolling</p>
        </div>
      </div>
    </div>
  );
}