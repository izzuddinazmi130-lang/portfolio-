import { useEffect, useRef, useState } from "react";
import MenuOverlay from "./MenuOverlay.jsx";
import SplitText from "./SplitText.jsx";
import { CAPS, TIMELINE, LANGUAGES, TOOLS, shotUrl } from "../data/about.js";
import ExperienceStage from "./ExperienceStage.jsx";
import EduLine from "./EduLine.jsx";
import { navigate, handleLinkClick } from "../navigate.js";

function onEnter(handler) {
  return (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

// A fanned stack of screenshots. Hover (or tap / use the dots) to bring another
// one to the front; the caption under the stack follows the front card.
function CapStack({ shots }) {
  const [front, setFront] = useState(0);
  const [failed, setFailed] = useState({});
  const [dragging, setDragging] = useState(false);
  const stackRef = useRef(null);
  const drag = useRef({ id: null, x: 0, dx: 0, moved: false });
  const n = shots.length;
  const urls = shots.map((s) => s.src || shotUrl(s));
  const current = shots[front];
  const go = (d) => setFront((f) => (f + d + n) % n);

  // Swipe / drag: works with a finger on a phone and with the mouse. Vertical
  // page scrolling still works (touch-action: pan-y in the CSS).
  function down(e) {
    drag.current = { id: e.pointerId, x: e.clientX, dx: 0, moved: false };
  }
  function move(e) {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x;
    if (!d.moved && Math.abs(d.dx) > 8) {
      d.moved = true;
      setDragging(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        /* not supported - dragging still works while the pointer stays over the stack */
      }
    }
    if (d.moved && stackRef.current) stackRef.current.style.setProperty("--dx", `${d.dx}px`);
  }
  function up(e) {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = null;
    if (stackRef.current) stackRef.current.style.setProperty("--dx", "0px");
    if (d.moved) {
      setDragging(false);
      if (Math.abs(d.dx) > 45) go(d.dx < 0 ? 1 : -1);
      // swallow the click that follows a drag
      const swallow = (ev) => ev.stopPropagation();
      window.addEventListener("click", swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener("click", swallow, true), 0);
    }
  }
  function key(e) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    }
  }

  return (
    <div className="ab-stackwrap">
      <div
        className={`ab-stack ${dragging ? "is-dragging" : ""} ${n < 2 ? "is-single" : ""}`}
        ref={stackRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
      >
        {shots.map((s, i) => {
          const pos = (i - front + n) % n; // 0 = front
          return (
            <div
              className={`ab-stack-card pos-${pos}`}
              key={s.file}
              role="button"
              tabIndex={pos === 0 ? 0 : -1}
              aria-label={pos === 0 ? s.label : `Show ${s.label}`}
              onClick={() => pos !== 0 && setFront(i)}
            >
              {urls[i] && !failed[s.file] ? (
                <img
                  src={urls[i]}
                  alt={s.label}
                  draggable="false"
                  loading="lazy"
                  decoding="async"
                  onError={() => setFailed((f) => ({ ...f, [s.file]: true }))}
                />
              ) : (
                <div className="ab-stack-missing">{s.label}</div>
              )}
            </div>
          );
        })}
      </div>
      <div className="ab-stack-cap" aria-live="polite">
        <span key={front} className="ab-stack-label">
          {current.label}
          {current.badge && <em className={current.badge === "Live" ? "is-live" : ""}>{current.badge}</em>}
        </span>
        <span className="ab-stack-nav" hidden={n < 2}>
          <button type="button" className="ab-arrow" aria-label="Previous screen" onClick={() => go(-1)}>
            ‹
          </button>
          <span className="ab-stack-dots">
            {shots.map((s, i) => (
              <button
                key={s.file}
                type="button"
                className={i === front ? "on" : ""}
                aria-label={`Show ${s.label}`}
                onClick={() => setFront(i)}
              ></button>
            ))}
          </span>
          <button type="button" className="ab-arrow" aria-label="Next screen" onClick={() => go(1)}>
            ›
          </button>
        </span>
      </div>
      <p className="ab-stack-hint" aria-hidden="true" hidden={n < 2}>
        <span className="hint-touch">Swipe to see the next screen</span>
        <span className="hint-mouse">Drag, click a card behind, or use the arrows</span>
      </p>
    </div>
  );
}

// For the card with nothing to screenshot: the process, drawn as three steps.
function CapFlow({ cap, strip }) {
  return (
    <div className={`ab-flow ${strip ? "is-strip" : ""}`}>
      <span className="ab-flow-title">{cap.flowTitle}</span>
      <ol>
        {cap.flow.map((f, i) => (
          <li key={f.step} style={{ "--i": i }}>
            <b>{f.step}</b>
            <span>{f.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// One picture in the hero collage. If the file can't be loaded it is left out
// (the rest of the hero still looks fine).
function HeroPic({ className, src }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <figure className={`ab-pic ${className}`}>
      <div className="ab-pic-in">
        <img src={src} alt="" decoding="async" onError={() => setFailed(true)} />
      </div>
    </figure>
  );
}

// true while the query matches (and keeps up when the window is resized).
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

// Photo for an experience entry. If it can't be loaded it simply isn't shown
// (the entry keeps working as plain text), so a wrong file name never leaves a hole.
function TlPhoto({ item }) {
  const [failed, setFailed] = useState(false);
  if (!item.img || failed) return null;
  return (
    <div className="ab-tl-media">
      <div className="ab-tl-photo">
        <img src={item.img} alt={item.place} loading="lazy" decoding="async" onError={() => setFailed(true)} />
        <span className="ab-tl-chip">{item.place}</span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const rootRef = useRef(null);
  const tlRef = useRef(null);
  const heroRef = useRef(null);
  const [armed, setArmed] = useState(false);
  // Pinned scroll-driven experience, unless motion is reduced or the screen is very short.
  const pinned = useMediaQuery("(prefers-reduced-motion: no-preference) and (min-height: 560px)");

  // Everything marked .ab-rv fades/slides up once as it enters the screen.
  useEffect(() => {
    setArmed(true);
    const items = rootRef.current.querySelectorAll(".ab-rv");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pinned]);

  // Experience timeline: the line draws itself as you read down, and each
  // dot lights up when you reach it.
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    const dots = tl.querySelectorAll(".ab-tl-item");
    let raf = null;
    function update() {
      raf = null;
      const vh = window.innerHeight;
      const rect = tl.getBoundingClientRect();
      const tops = Array.from(dots, (el) => el.getBoundingClientRect().top);
      const p = Math.min(1, Math.max(0, (vh * 0.62 - rect.top) / rect.height));
      tl.style.setProperty("--tlp", p.toFixed(4));
      dots.forEach((el, i) => el.classList.toggle("on", tops[i] < vh * 0.62));
    }
    function request() {
      if (raf === null) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [pinned]);

  // Hero collage: the pictures drift a little with the mouse and with scrolling.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = null;
    function onScroll() {
      if (raf !== null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const h = hero.offsetHeight || 1;
        hero.style.setProperty("--sy", Math.min(1.4, Math.max(0, window.scrollY / h)).toFixed(3));
      });
    }
    function onMove(e) {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      hero.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    }
    function onLeave() {
      hero.style.setProperty("--mx", "0");
      hero.style.setProperty("--my", "0");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("scroll", onScroll);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className={`ab-page ${armed ? "ab-armed" : ""}`} ref={rootRef}>
      <MenuOverlay />

      <header className="ab-hero" ref={heroRef}>
        <a className="ab-brand" href="/" onClick={(e) => handleLinkClick(e, "/")}>
          M. IZZUDDIN
        </a>
        <div className="ab-hero-grid">
          <div className="ab-hero-copy">
            <span className="ab-kicker">About</span>
            <h1>
              <SplitText>A developer who stays with the problem.</SplitText>
            </h1>
            <p>
              I&apos;m Muhammad Izzuddin, a full-stack programmer from Kuala Terengganu. I work across the database,
              backend, interface, and deployment so the final product is practical for the people using it every day.
            </p>
            <ul className="ab-facts">
              <li>
                <span>Role</span>
                <b>Full-Stack Programmer</b>
              </li>
              <li>
                <span>Based in</span>
                <b>Kuala Terengganu</b>
              </li>
            </ul>
          </div>

          <div className="ab-collage">
            <div className="ab-collage-glow" aria-hidden="true"></div>
            <div className="ab-collage-ring" aria-hidden="true"></div>
            {/* <HeroPic className="ab-pic-1" src="/about/hero1.png" /> */}
            <HeroPic className="ab-pic-2" src="/about/hero2.png" />
            <div className="ab-band">
              <div
                className="ab-band-track"
                role="link"
                tabIndex={0}
                aria-label="Open to work - get in touch"
                title="Let's talk"
                onClick={() => navigate("/contact")}
                onKeyDown={onEnter(() => navigate("/contact"))}
              >
                <i className="ab-band-dot" aria-hidden="true"></i>
                <span className="ab-band-text">#OPENTOWORK</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="ab-main">
        {/* ---------- How I work ---------- */}
        <div className="ab-sec">
          <div className="ab-head ab-rv">
            <span className="ab-no">01</span>
            <h2>How I work</h2>
            <p>What being the only developer on most of these projects has taught me.</p>
          </div>
          <div className="ab-caps">
            {CAPS.map((cap) => (
              <div className="ab-cap ab-rv" key={cap.title}>
                <div className="ab-cap-text">
                  <span className="ab-cap-tag">{cap.tag}</span>
                  <h3>{cap.title}</h3>
                  <p>{cap.body}</p>
                  {cap.footnote && (
                    <p className={`ab-cap-note ${cap.footnote.live ? "has-live" : ""}`}>
                      {cap.footnote.live && <i className="ab-live-dot" aria-hidden="true"></i>}
                      {cap.footnote.text}
                    </p>
                  )}
                  {cap.href && (
                    <a className="ab-link" href={cap.href} onClick={(e) => handleLinkClick(e, cap.href)}>
                      {cap.cta} <span aria-hidden="true">-&gt;</span>
                    </a>
                  )}
                </div>
                <div className="ab-cap-media">
                  {cap.shots && <CapStack shots={cap.shots} />}
                  {cap.flow && <CapFlow cap={cap} strip={!!cap.shots} />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Experience ---------- */}
        {!pinned && (
        <div className="ab-sec">
          <div className="ab-head ab-rv">
            <span className="ab-no">02</span>
            <h2>Experience</h2>
            <EduLine />
          </div>
          {(
            <div className="ab-tl" ref={tlRef}>
              <div className="ab-tl-line" aria-hidden="true">
                <div className="ab-tl-fill"></div>
              </div>
              {TIMELINE.map((t) => (
                <div className={`ab-tl-item ab-rv ${t.secondary ? "is-secondary" : ""}`} key={t.role}>
                  <span className="ab-tl-dot" aria-hidden="true"></span>
                  <div className="ab-tl-date">{t.date}</div>
                  <div className="ab-tl-body">
                    <div className="ab-tl-role">{t.role}</div>
                    <div className="ab-tl-org">{t.org}</div>
                    {t.desc && <p className="ab-tl-desc">{t.desc}</p>}
                  </div>
                  <TlPhoto item={t} />
                </div>
              ))}
            </div>
          )}
        </div>
        )}
        {pinned && <ExperienceStage />}

        {/* ---------- Skills ---------- */}
        <div className="ab-sec">
          <div className="ab-head ab-rv">
            <span className="ab-no">03</span>
            <h2>Skills</h2>
            <p>Tools I reach for when building and shipping a system.</p>
          </div>
          <div className="ab-skills">
            <div className="ab-skill-group ab-rv">
              <h4>languages &amp; frameworks</h4>
              <div className="ab-chips">
                {LANGUAGES.map((s, i) => (
                  <span className="ab-chip" style={{ "--i": i }} key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="ab-skill-group ab-rv">
              <h4>tools &amp; environments</h4>
              <div className="ab-chips">
                {TOOLS.map((s, i) => (
                  <span className="ab-chip" style={{ "--i": i }} key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---------- Where next ---------- */}
      <div className="ab-cta">
        <div
          className="ab-cta-card"
          role="link"
          tabIndex={0}
          onClick={() => navigate("/projects")}
          onKeyDown={onEnter(() => navigate("/projects"))}
        >
          <span>Next</span>
          <b>See the work</b>
          <i aria-hidden="true">→</i>
        </div>
        <div
          className="ab-cta-card ab-cta-alt"
          role="link"
          tabIndex={0}
          onClick={() => navigate("/contact")}
          onKeyDown={onEnter(() => navigate("/contact"))}
        >
          <span>Or</span>
          <b>Say hello</b>
          <i aria-hidden="true">→</i>
        </div>
      </div>
    </div>
  );
}