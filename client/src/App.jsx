import { useEffect, useRef, useState } from "react";
import Hero from "./components/Hero.jsx";
import Systems from "./components/Systems.jsx";
import Expertise from "./components/Expertise.jsx";
import Contact from "./components/Contact.jsx";
import MenuOverlay from "./components/MenuOverlay.jsx";
import AnimatedNumber from "./components/AnimatedNumber.jsx";
import ProjectsPage from "./components/ProjectsPage.jsx";
import ProjectDetailPage from "./components/ProjectDetailPage.jsx";
import AboutPage from "./components/AboutPage.jsx";
import LegalPage from "./components/LegalPage.jsx";
import ContactPage from "./components/ContactPage.jsx";
import ScrollRevealSymbol from "./components/ScrollRevealSymbol.jsx";

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  const introRef = useRef(null);

  useEffect(() => {
    function onPopState() {
      setPath(window.location.pathname);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Reveal each section as it scrolls into view. The "reveal-pending" class
  // is only added here in JS, so the page still shows everything normally
  // if JavaScript fails to run - this is a progressive enhancement, not a
  // requirement for the content to be visible.
  useEffect(() => {
    const targets = document.querySelectorAll("section, footer#contact, .stats-strip");
    const detailTargets = document.querySelectorAll(
      ".stat-chip, .tile, .xp-item, .also-item"
    );
    targets.forEach((el, index) => {
      el.classList.add("reveal-pending");
      if (index % 3 === 0) {
        el.classList.add("reveal-slide-left");
      } else if (index % 3 === 1) {
        el.classList.add("reveal-lift");
      } else {
        el.classList.add("reveal-slide-right");
      }
    });
    detailTargets.forEach((el, index) => {
      el.classList.add("reveal-item");
      el.style.setProperty("--reveal-delay", `${(index % 6) * 65}ms`);
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    targets.forEach((el) => io.observe(el));
    detailTargets.forEach((el) => io.observe(el));

    const magneticTargets = document.querySelectorAll("a:not(.brand-dark):not(.ab-brand):not(.cp-brand):not(.cp-link), button");
    const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const cleanups = [];
    if (supportsHover) {
      magneticTargets.forEach((el) => {
        function move(event) {
          const rect = el.getBoundingClientRect();
          const strength = el.matches(".menu-toggle") ? 0.16 : 0.22;
          const x = (event.clientX - (rect.left + rect.width / 2)) * strength;
          const y = (event.clientY - (rect.top + rect.height / 2)) * strength;
          el.style.setProperty("--magnetic-x", `${x.toFixed(2)}px`);
          el.style.setProperty("--magnetic-y", `${y.toFixed(2)}px`);
          el.classList.add("magnetic-active");
        }
        function leave() {
          el.style.setProperty("--magnetic-x", "0px");
          el.style.setProperty("--magnetic-y", "0px");
          el.classList.remove("magnetic-active");
        }
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });
    }

    // Runs at most once per frame (not once per scroll event, which can fire
    // several times a frame), and reads every element's position before
    // writing any styles - interleaving the two forces the browser to
    // recalculate layout for each element in turn, which is a common source
    // of scroll jank.
    let progressFrame = null;
    function updateScrollProgress() {
      progressFrame = null;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;

      const drifts = Array.from(detailTargets, (el, index) => {
        const rect = el.getBoundingClientRect();
        const distance = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        return Math.max(-18, Math.min(18, distance * -14 + (index % 2 ? 3 : -3)));
      });

      document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(3));
      detailTargets.forEach((el, index) => {
        el.style.setProperty("--scroll-drift", `${drifts[index].toFixed(2)}px`);
      });
    }
    function requestScrollProgressUpdate() {
      if (progressFrame === null) progressFrame = requestAnimationFrame(updateScrollProgress);
    }
    updateScrollProgress();
    window.addEventListener("scroll", requestScrollProgressUpdate, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", requestScrollProgressUpdate);
      if (progressFrame !== null) cancelAnimationFrame(progressFrame);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [path]);

  // /projects/<slug> is a single project's page; /projects is the list.
  const projectSlug = path.startsWith("/projects/") ? path.slice("/projects/".length).replace(/\/+$/, "") : "";
  if (projectSlug) return <ProjectDetailPage slug={projectSlug} />;
  if (path === "/projects" || path === "/projects/") return <ProjectsPage />;
  if (path === "/about" || path === "/about/") return <AboutPage />;
  if (path === "/privacy" || path === "/privacy/") return <LegalPage kind="privacy" />;
  if (path === "/cookies" || path === "/cookies/") return <LegalPage kind="cookies" />;
  if (path === "/contact") return <ContactPage />;

  return (
    <>
      <div className="blob blob-a"></div>
      <div className="blob blob-b"></div>
      <MenuOverlay />

      <Hero />

      <div className="wrap">
        <div>
          <div className="stats-strip">
          <div className="stat-chip">
            <span>Role</span>
            <b>Full-Stack Programmer / Web Developer</b>
          </div>
          <div className="stat-chip">
            <span>Current Company</span>
            <b>AS Tech Legacy Group</b>
          </div>
          <div className="stat-chip">
            <span>Team Size</span>
            <b>Sole Developer in Marketing Department</b>
          </div>
          <div className="stat-chip">
            <span>Systems shipped</span>
            <b>
              <AnimatedNumber value={3} suffix=" live/built in 2026" />
            </b>
          </div>
          <div className="stat-chip">
            <span>Stack</span>
            <b>PHP · Laravel · JS · HTML · CSS · React · Node.js</b>
          </div>
          </div>

          <section className="intro-section home-intro" ref={introRef}>
            <div className="intro-kicker">A developer who stays with the problem</div>
            <h1>I build useful systems, not just polished screens.</h1>
            <p>
              I&apos;m Muhammad Izzuddin, a full-stack programmer from Kuala Terengganu. I work across the database,
              backend, interface, and deployment so the final product is practical for the people using it every day.
            </p>
          </section>

        </div>

        <ScrollRevealSymbol introRef={introRef}>
          <Systems preview />
          <Expertise />
          <Contact />
        </ScrollRevealSymbol>
      </div>
    </>
  );
}