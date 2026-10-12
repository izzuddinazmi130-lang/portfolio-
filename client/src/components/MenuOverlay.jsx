import { useState, useEffect } from "react";
import { navigate } from "../navigate.js";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "All projects" },
  { href: "/contact", label: "Contact" },
];

export default function MenuOverlay() {
  const [open, setOpen] = useState(false);
  const here = typeof window !== "undefined" ? window.location.pathname.replace(/\/+$/, "") || "/" : "/";

  function handleNavigation(e, href) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
    e.preventDefault();
    navigate(href);
    setOpen(false);
  }

  // Allow Escape to close the menu.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        className="menu-toggle"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`menu-overlay ${open ? "open" : ""}`}>
        <nav>
          {LINKS.map((l) => {
            const current = l.href === "/" ? here === "/" : here === l.href || here.startsWith(`${l.href}/`);
            return (
              <a
                key={l.href}
                href={l.href}
                className={current ? "current" : ""}
                aria-current={current ? "page" : undefined}
                onClick={(e) => handleNavigation(e, l.href)}
              >
                {l.label}
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}