import { useEffect, useRef, useState } from "react";
import MenuOverlay from "./MenuOverlay.jsx";
import SplitText from "./SplitText.jsx";
import AlsoBuilt from "./AlsoBuilt.jsx";
import Contact from "./Contact.jsx";
import { SHOWCASE, coverOf } from "../data/showcase.js";
import { navigate, handleLinkClick } from "../navigate.js";

// Scroll-driven stage is desktop-only. On phones / small or short windows the
// same projects are shown as a plain stacked list instead (see ProjectStack),
// because pinned scroll effects fight touch scrolling.
const STAGE_QUERY = "(min-width: 901px) and (min-height: 560px)";

// How much scrolling (in viewport heights) it takes to move from one project
// to the next. Bigger = slower, more deliberate.
const SCROLL_PER_PROJECT_VH = 85;

// Smoothing of the cards/list towards the scroll position (0-1 per 60fps
// frame). Lower = floatier.
const STAGE_EASE = 0.12;

// After scrolling stops for this long (ms), the stage gently settles on the
// nearest project instead of leaving two half-way between.
const SNAP_DELAY_MS = 160;

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function openProject(slug) {
  navigate(`/projects/${slug}`);
}

function onEnter(handler) {
  return (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

// The homepage screenshot, or a gradient placeholder for projects that don't
// have screenshots yet.
function Cover({ project, eager = false }) {
  const src = coverOf(project);
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${project.name} homepage`}
        draggable="false"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="pj-cover-fallback" style={{ background: project.gradient }}>
      <span>{project.name}</span>
      <small>{src ? `Can't load ${src}` : "Screenshots coming soon"}</small>
    </div>
  );
}

function ProjectStage() {
  const wrapRef = useRef(null);
  const stageRef = useRef(null);
  const cardRefs = useRef([]);
  const rowRefs = useRef([]);
  const [active, setActive] = useState(0);
  const n = SHOWCASE.length;

  function scrollToIndex(i) {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const total = wrap.offsetHeight - window.innerHeight;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + (i / (n - 1)) * total, behavior: "smooth" });
  }

  // Clicking the centred project opens it; clicking any other one brings it
  // to the centre first.
  function choose(i) {
    if (i === active) openProject(SHOWCASE[i].slug);
    else scrollToIndex(i);
  }

  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = stageRef.current;
    if (!wrap || !stage) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let target = 0; // where the scroll position says we should be (0 .. n-1)
    let shown = 0; // where we are actually drawn (eases towards target)
    let step = 0; // horizontal distance between neighbouring cards, in px
    let raf = null;
    let lastTime = 0;
    let snapTimer = null;
    let lastActive = 0;

    function measure() {
      const first = cardRefs.current[0];
      if (!first) return;
      // Gap between cards. Small enough that a sliver of the neighbouring
      // projects peeks in at both edges, hinting there is more to scroll to.
      step = first.offsetWidth + Math.max(window.innerWidth * 0.026, 36);
    }

    function readTarget() {
      const rect = wrap.getBoundingClientRect();
      const total = wrap.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
      target = p * (n - 1);
    }

    function paint() {
      stage.style.setProperty("--f", shown.toFixed(4));
      cardRefs.current.forEach((el, i) => {
        if (!el) return;
        // Project i sits i steps to the LEFT of the centre, and the whole strip
        // moves to the RIGHT as you scroll: the current project slides out to
        // the right while the next one slides in from the left.
        const x = (shown - i) * step;
        const dist = Math.min(Math.abs(shown - i), 1);
        const scale = 1 - dist * 0.14;
        el.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,0,0) scale(${scale.toFixed(4)})`;
        el.style.opacity = String(1 - dist * 0.58);
        el.style.zIndex = String(10 - Math.round(Math.abs(shown - i) * 4));
      });
      rowRefs.current.forEach((el, i) => {
        if (!el) return;
        const dist = Math.min(Math.abs(shown - i), 1);
        el.style.opacity = String(1 - dist * 0.62);
        el.style.transform = `translateX(${((1 - dist) * 16).toFixed(1)}px)`;
      });
      const idx = Math.round(shown);
      if (idx !== lastActive) {
        lastActive = idx;
        setActive(idx);
      }
    }

    function frame(now) {
      raf = null;
      const dt = Math.min(Math.max(now - (lastTime || now), 1), 50);
      lastTime = now;
      const diff = target - shown;
      if (reduceMotion || Math.abs(diff) < 0.0008) {
        shown = target;
      } else {
        shown += diff * (1 - Math.pow(1 - STAGE_EASE, dt / 16.667));
      }
      paint();
      if (shown !== target) raf = requestAnimationFrame(frame);
      else lastTime = 0;
    }

    function kick() {
      if (raf === null) raf = requestAnimationFrame(frame);
    }

    function snap() {
      const rect = wrap.getBoundingClientRect();
      // Only while the stage is actually pinned on screen.
      if (rect.top > 0 || rect.bottom < window.innerHeight) return;
      const idx = Math.round(target);
      if (Math.abs(target - idx) < 0.015) return;
      scrollToIndex(idx);
    }

    function onScroll() {
      readTarget();
      kick();
      clearTimeout(snapTimer);
      if (!reduceMotion) snapTimer = setTimeout(snap, SNAP_DELAY_MS);
    }

    function onResize() {
      measure();
      readTarget();
      shown = target;
      paint();
    }

    measure();
    readTarget();
    shown = target; // reloading half-way down the page starts in the right place
    paint();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (raf !== null) cancelAnimationFrame(raf);
      clearTimeout(snapTimer);
    };
    // scrollToIndex only uses refs and constants, so it is safe to leave out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const current = SHOWCASE[active];

  return (
    <div
      className="pj-stage-wrap"
      ref={wrapRef}
      style={{ "--n": n, "--per": `${SCROLL_PER_PROJECT_VH}vh` }}
    >
      <div className="pj-stage" ref={stageRef}>
        <aside className="pj-list" aria-label="Projects">
          <div className="pj-list-label">Selected systems</div>
          <div className="pj-list-body">
            <span className="pj-list-marker" aria-hidden="true"></span>
            <ul className="pj-list-rows">
              {SHOWCASE.map((p, i) => (
                <li
                  key={p.slug}
                  ref={(el) => (rowRefs.current[i] = el)}
                  className={`pj-row ${i === active ? "is-active" : ""}`}
                  role="button"
                  tabIndex={0}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => choose(i)}
                  onKeyDown={onEnter(() => choose(i))}
                >
                  <span className="pj-row-num">0{i + 1}</span>
                  <span className="pj-row-name">{p.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="pj-main">
          <div className="pj-track">
            {SHOWCASE.map((p, i) => (
              <div
                key={p.slug}
                ref={(el) => (cardRefs.current[i] = el)}
                className={`pj-card ${i === active ? "is-active" : ""}`}
                role="link"
                tabIndex={i === active ? 0 : -1}
                aria-label={`Open ${p.name}`}
                onClick={() => choose(i)}
                onKeyDown={onEnter(() => choose(i))}
              >
                <Cover project={p} eager />
                <span className="pj-card-cta" aria-hidden="true">
                  Open project <svg className="ar-ne" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 11.5L11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
              </div>
            ))}
          </div>

          <div className="pj-caption" key={current.slug}>
            <div className="pj-cap-main">
              <span className={`pj-status ${current.status}`}>{current.statusLabel}</span>
              <p className="pj-cap-blurb">{current.blurb}</p>
            </div>
            <a
              className="pj-cap-open"
              href={`/projects/${current.slug}`}
              onClick={(e) => handleLinkClick(e, `/projects/${current.slug}`)}
            >
              Open project <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </div>

        <div className="pj-counter" aria-hidden="true">
          0{active + 1} <i>/</i> 0{n}
        </div>
        <div className="pj-hint" aria-hidden="true">
          <span></span> Scroll
        </div>
      </div>
    </div>
  );
}

// Must match --step in .pj-stack-item (index.css): how far each stuck card sits
// below the one before it, so the pile shows a sliver of every card.
const STACK_STEP_PX = 12;

// Phone layout: each project is a card that sticks near the top of the screen;
// the next card slides up over it while the one underneath shrinks back and
// dims, like a deck of cards being dealt. The picture on each card also
// unveils (wipes in, settling from a slight zoom) the first time it appears.
function ProjectStack() {
  const stackRef = useRef(null);
  const itemRefs = useRef([]);
  const cardRefs = useRef([]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Hidden-until-revealed styles only apply once this is set, so nothing is
    // lost if scripts fail.
    stack.classList.add("is-armed");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    itemRefs.current.forEach((el) => el && io.observe(el));

    let raf = null;
    function update() {
      raf = null;
      const items = itemRefs.current;
      // The sticky pile is switched off in CSS on short screens; then there is
      // nothing to animate here.
      const sticky = items[0] && getComputedStyle(items[0]).position === "sticky";
      for (let i = 0; i < items.length; i++) {
        const card = cardRefs.current[i];
        const next = items[i + 1];
        if (!card) continue;
        if (!sticky || !next) {
          card.style.transform = "";
          card.style.setProperty("--cover", "0");
          continue;
        }
        const r = items[i].getBoundingClientRect();
        const nr = next.getBoundingClientRect();
        // 0 = next card hasn't reached this one, 1 = next card fully on top.
        const covered = Math.min(Math.max((r.bottom - nr.top) / Math.max(r.height - STACK_STEP_PX, 1), 0), 1);
        card.style.transform = `scale(${(1 - covered * 0.07).toFixed(4)})`;
        card.style.setProperty("--cover", (covered * 0.55).toFixed(3));
      }
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
      io.disconnect();
      stack.classList.remove("is-armed");
    };
  }, []);

  return (
    <div className="pj-stack" ref={stackRef}>
      <p className="pj-stack-hint">Scroll through · tap a card to open</p>
      {SHOWCASE.map((p, i) => (
        <div
          key={p.slug}
          ref={(el) => (itemRefs.current[i] = el)}
          className="pj-stack-item"
          style={{ "--i": i }}
          role="link"
          tabIndex={0}
          aria-label={`Open ${p.name}`}
          onClick={() => openProject(p.slug)}
          onKeyDown={onEnter(() => openProject(p.slug))}
        >
          <div className="pj-stack-card" ref={(el) => (cardRefs.current[i] = el)}>
            <div className="pj-stack-media">
              <Cover project={p} />
            </div>
            <div className="pj-stack-meta">
              <span className="pj-stack-name">
                <i>0{i + 1}</i> {p.name}
              </span>
              <span className={`pj-status ${p.status}`}>{p.statusLabel}</span>
            </div>
            <p className="pj-stack-blurb">{p.blurb}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProjectsPage() {
  const showStage = useMediaQuery(STAGE_QUERY);

  useEffect(() => {
    const targets = document.querySelectorAll("section");
    targets.forEach((el) => el.classList.add("reveal-pending"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <MenuOverlay />
      <header className="projects-hero pj-hero">
        <a className="brand-dark" href="/" onClick={(e) => handleLinkClick(e, "/")}>
          M. IZZUDDIN
        </a>
        <div className="projects-hero-copy">
          <span>Selected work</span>
          <h1>
            <SplitText>Systems built from the inside out.</SplitText>
          </h1>
          <p>Scroll through the builds, then open one to see how it works.</p>
        </div>
      </header>

      {showStage ? <ProjectStage /> : <ProjectStack />}

      <main className="wrap projects-main">
        <section id="also">
          <AlsoBuilt />
        </section>
      </main>

      <div className="pg-footer">
        <Contact />
      </div>
    </>
  );
}