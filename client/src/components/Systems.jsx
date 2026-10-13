import { useEffect, useState } from "react";
import { fetchProjects, FALLBACK_PROJECTS } from "../api.js";
import AlsoBuilt from "./AlsoBuilt.jsx";
import { getProject, coverOf } from "../data/showcase.js";
import { handleLinkClick } from "../navigate.js";

// Each status gets its own gradient so tiles stay visually distinct even
// before you swap in real screenshots (just add an "image" URL field to a
// project in projects.json and it'll be used as the tile background instead).
// Homepage preview shows these two, in this order, picked by id.
const PREVIEW_IDS = ["kaftanasia", "alphard-chauffeur"];

const GRADIENTS = {
  live: "linear-gradient(135deg, #163A6B 0%, #2F6FED 100%)",
  built: "linear-gradient(135deg, #1B2A44 0%, #4A6FA8 100%)",
  inherited: "linear-gradient(135deg, #0B1220 0%, #29406E 100%)",
};

export default function Systems({ preview = false }) {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchProjects()
      .then((data) => setProjects(data))
      .catch(() => {
        console.warn("Could not reach the projects API, showing fallback data.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Subtle 3D tilt that follows the cursor - purely cosmetic, resets on mouse leave.
  function handleTileMove(e) {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
  }
  function resetTile(e) {
    e.currentTarget.style.transform = "perspective(700px) rotateX(0deg) rotateY(0deg) translateY(0)";
  }

  let shown = projects;
  if (preview) {
    const picked = PREVIEW_IDS.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
    shown = picked.length ? picked : projects.slice(0, 2);
  }
  // The card shows the site's homepage screenshot (client/public/<folder>/).
  function tileBackground(p) {
    const cover = coverOf(getProject(p.id));
    const img = cover || p.image;
    return img ? `url(${img}) center top / cover no-repeat` : GRADIENTS[p.status] || GRADIENTS.built;
  }

  return (
    <section id="systems">
      <div className="section-head">
        <h2>Systems I've built</h2>
        <p>Every one of these was built from database to deployment by me, including the admin tools behind them. Click a tile for details.</p>
      </div>

      {loading && <div className="loading-row">Loading systems…</div>}

      <div className="tile-grid">
        {shown.map((p) => {
          const isActive = activeId === p.id;
          return (
            <div
              key={p.id}
              className={`tile ${isActive ? "active" : ""}`}
              style={{ background: tileBackground(p) }}
              onClick={() => setActiveId(isActive ? null : p.id)}
              onMouseMove={handleTileMove}
              onMouseLeave={resetTile}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && setActiveId(isActive ? null : p.id)}
            >
              <div className="tile-scrim"></div>
              <div className="tile-body">
                <div className={`sys-status ${p.status}`}>{p.statusLabel}</div>
                <div className="tile-title">{p.name}</div>
                <div className={`tile-detail ${isActive ? "show" : ""}`}>
                  <p>{p.description}</p>
                  <div className="role">{p.role}</div>
                  <div className="stack">
                    {p.stack.map((s) => (
                      <span className="tag" key={s}>
                        {s}
                      </span>
                    ))}
                  </div>
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      Visit site <svg className="ar-ne" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false"><path d="M4.5 11.5L11.5 4.5M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </a>
                  )}
                  {getProject(p.id) && (
                    <a
                      href={`/projects/${p.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLinkClick(e, `/projects/${p.id}`);
                      }}
                    >
                      View project -&gt;
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {preview && (
        <a className="view-all-link" href="/projects">
          View all projects <span aria-hidden="true">-&gt;</span>
        </a>
      )}

      {!preview && <AlsoBuilt />}
    </section>
  );
}