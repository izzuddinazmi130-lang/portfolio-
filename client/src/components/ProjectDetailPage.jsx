import { useCallback, useEffect, useRef, useState } from "react";
import MenuOverlay from "./MenuOverlay.jsx";
import Contact from "./Contact.jsx";
import { SHOWCASE, getProject, imageUrl, coverOf } from "../data/showcase.js";
import { navigate, handleLinkClick } from "../navigate.js";

function onEnter(handler) {
  return (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler();
    }
  };
}

// Full-size viewer for the screenshots. Click outside / Esc to close,
// arrow keys (or the side buttons) to move between screens.
function Lightbox({ shots, index, onClose, onIndex }) {
  const shot = shots[index];
  const count = shots.length;

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onIndex((index + 1) % count);
      else if (e.key === "ArrowLeft") onIndex((index - 1 + count) % count);
    }
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [index, count, onClose, onIndex]);

  return (
    <div className="pj-lb" role="dialog" aria-modal="true" aria-label={shot.label} onClick={onClose}>
      <button className="pj-lb-close" aria-label="Close" onClick={onClose}>
        ×
      </button>
      {count > 1 && (
        <button
          className="pj-lb-nav pj-lb-prev"
          aria-label="Previous screen"
          onClick={(e) => {
            e.stopPropagation();
            onIndex((index - 1 + count) % count);
          }}
        >
          ‹
        </button>
      )}
      <figure className="pj-lb-figure" onClick={(e) => e.stopPropagation()}>
        <img key={shot.src} src={shot.src} alt={shot.label} />
        <figcaption>
          <b>
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </b>{" "}
          {shot.label}
        </figcaption>
      </figure>
      {count > 1 && (
        <button
          className="pj-lb-nav pj-lb-next"
          aria-label="Next screen"
          onClick={(e) => {
            e.stopPropagation();
            onIndex((index + 1) % count);
          }}
        >
          ›
        </button>
      )}
    </div>
  );
}

function ProjectDetail({ project }) {
  const index = SHOWCASE.indexOf(project);
  const total = SHOWCASE.length;
  const next = SHOWCASE[(index + 1) % total];
  const nextCover = coverOf(next);

  const shots = project.images.map((img) => ({ src: imageUrl(project, img), label: img.label }));
  const [lightbox, setLightbox] = useState(null); // index into `shots`, or null
  const [armed, setArmed] = useState(false); // scroll-reveal only runs once JS is up
  const [failed, setFailed] = useState({}); // src -> true for screenshots that could not be loaded
  const markFailed = (src) => setFailed((f) => ({ ...f, [src]: true }));
  const progressRef = useRef(null);
  const galleryRef = useRef(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  // Thin reading-progress bar along the top edge.
  useEffect(() => {
    let raf = null;
    function update() {
      raf = null;
      const bar = progressRef.current;
      if (!bar) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      bar.style.transform = `scaleX(${p.toFixed(4)})`;
    }
    function onScroll() {
      if (raf === null) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  // Screens fade/slide up as they scroll into view.
  useEffect(() => {
    setArmed(true);
    const gallery = galleryRef.current;
    if (!gallery) return;
    const items = gallery.querySelectorAll(".pj-shot");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Gentle 3D tilt that follows the cursor on the homepage picture.
  function tiltMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1100px) rotateX(${(-y * 5).toFixed(2)}deg) rotateY(${(x * 6).toFixed(2)}deg)`;
  }
  function tiltLeave(e) {
    e.currentTarget.style.transform = "";
  }

  const gallery = shots.slice(1);
  const hasShots = shots.length > 0;

  return (
    <div className={`pj-detail ${armed ? "pj-armed" : ""}`}>
      <div className="pj-progress" ref={progressRef} aria-hidden="true"></div>
      <MenuOverlay />

      <header className="pj-top">
        <a className="brand-dark" href="/" onClick={(e) => handleLinkClick(e, "/")}>
          M. IZZUDDIN
        </a>
      </header>

      <main className="pj-wrap">
        <a className="pj-back" href="/projects" onClick={(e) => handleLinkClick(e, "/projects")}>
          <span aria-hidden="true">&lt;-</span> All projects
        </a>

        <div className="pj-kicker">
          <span>
            0{index + 1} <i>/</i> 0{total}
          </span>
          <span className={`pj-status ${project.status}`}>{project.statusLabel}</span>
        </div>

        <h1 className="pj-title">{project.name}</h1>

        <dl className="pj-meta">
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{project.category.join(" · ")}</dd>
          </div>
          <div>
            <dt>Link</dt>
            <dd>
              {project.link ? (
                <a href={project.link} target="_blank" rel="noopener noreferrer" className="pj-visit">
                  Visit live site <svg className="ar-ne" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 11.5L11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </a>
              ) : (
                project.linkNote || "Not public yet"
              )}
            </dd>
          </div>
        </dl>

        <div className="pj-hero-shot">
          {hasShots && !failed[shots[0].src] ? (
            <div
              className="pj-hero-tilt"
              role="button"
              tabIndex={0}
              aria-label={`Enlarge ${shots[0].label}`}
              onMouseMove={tiltMove}
              onMouseLeave={tiltLeave}
              onClick={() => setLightbox(0)}
              onKeyDown={onEnter(() => setLightbox(0))}
            >
              <img
                src={shots[0].src}
                alt={`${project.name} homepage`}
                decoding="async"
                onError={() => markFailed(shots[0].src)}
              />
              <span className="pj-zoom-hint" aria-hidden="true">
                Click to enlarge
              </span>
            </div>
          ) : (
            <div className="pj-hero-tilt pj-hero-empty" style={{ background: project.gradient }}>
              <span>{project.name}</span>
              <small>{hasShots ? `Can't load ${shots[0].src}` : "Screenshots coming soon"}</small>
            </div>
          )}
        </div>

        <div className="pj-about">
          <div className="pj-label">About the build</div>
          <p>{project.description}</p>
        </div>

        {gallery.length > 0 && (
          <>
            <div className="pj-gallery-head">
              <span className="pj-label">The screens</span>
              <span className="pj-gallery-count">
                {gallery.length} more · click any to enlarge
              </span>
            </div>
            <div className="pj-gallery" ref={galleryRef}>
              {gallery.map((shot, i) => (
                <figure
                  key={shot.src}
                  className={`pj-shot pj-s${i % 7}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Enlarge ${shot.label}`}
                  onClick={() => !failed[shot.src] && setLightbox(i + 1)}
                  onKeyDown={onEnter(() => !failed[shot.src] && setLightbox(i + 1))}
                >
                  <div className="pj-shot-frame">
                    {failed[shot.src] ? (
                      <div className="pj-shot-missing">
                        <b>Image not found</b>
                        <code>{shot.src}</code>
                        <span>Check the file name (spelling, capitals, .png) and that it is in client/public.</span>
                      </div>
                    ) : (
                      <img
                        src={shot.src}
                        alt={`${project.name}: ${shot.label}`}
                        loading="lazy"
                        decoding="async"
                        onError={() => markFailed(shot.src)}
                      />
                    )}
                  </div>
                  <figcaption>
                    <b>{String(i + 2).padStart(2, "0")}</b> {shot.label}
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        )}
      </main>

      <div
        className="pj-next"
        role="link"
        tabIndex={0}
        aria-label={`Next project: ${next.name}`}
        onClick={() => navigate(`/projects/${next.slug}`)}
        onKeyDown={onEnter(() => navigate(`/projects/${next.slug}`))}
      >
        <div
          className="pj-next-bg"
          style={nextCover ? { backgroundImage: `url(${nextCover})` } : { background: next.gradient }}
        ></div>
        <div className="pj-next-shade"></div>
        <div className="pj-next-inner">
          <span className="pj-next-label">
            Next project <i>/</i> 0{SHOWCASE.indexOf(next) + 1}
          </span>
          <span className="pj-next-title">{next.name}</span>
          <span className="pj-next-arrow" aria-hidden="true">
            →
          </span>
        </div>
      </div>

      <div className="pg-footer">
        <Contact />
      </div>

      {lightbox !== null && shots[lightbox] && (
        <Lightbox shots={shots} index={lightbox} onClose={closeLightbox} onIndex={setLightbox} />
      )}
    </div>
  );
}

function NotFound() {
  return (
    <div className="pj-detail pj-notfound">
      <MenuOverlay />
      <header className="pj-top">
        <a className="brand-dark" href="/" onClick={(e) => handleLinkClick(e, "/")}>
          M. IZZUDDIN
        </a>
      </header>
      <main className="pj-wrap">
        <div className="pj-kicker">
          <span>404</span>
        </div>
        <h1 className="pj-title">No such project</h1>
        <a className="pj-back" href="/projects" onClick={(e) => handleLinkClick(e, "/projects")}>
          <span aria-hidden="true">&lt;-</span> Back to all projects
        </a>
      </main>
    </div>
  );
}

export default function ProjectDetailPage({ slug }) {
  const project = getProject(slug);
  if (!project) return <NotFound />;
  // key = remount when moving from one project straight to another, so the
  // lightbox, reveal state and observers all start fresh.
  return <ProjectDetail key={project.slug} project={project} />;
}