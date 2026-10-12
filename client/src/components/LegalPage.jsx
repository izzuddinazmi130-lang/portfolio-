import { useEffect, useRef, useState } from "react";
import MenuOverlay from "./MenuOverlay.jsx";
import { handleLinkClick } from "../navigate.js";

const UPDATED = "6 October 2026";
const EMAIL = "izzuddinazmi130@gmail.com";

const PAGES = {
  privacy: {
    kicker: "Legal",
    title: "Privacy policy",
    intro:
      "A short, plain-language note on what this portfolio does with your information. The short version: very little, and only to reply to you.",
    sections: [
      {
        h: "Who I am",
        p: [
          `This site belongs to Muhammad Izzuddin, a full-stack programmer based in Kuala Terengganu, Malaysia. You can reach me at ${EMAIL}.`,
        ],
      },
      {
        h: "What I collect",
        p: [
          "Only what you choose to send me. If you use the contact form, that's your name, your email address and your message. If you email or message me directly (email, WhatsApp), I receive whatever you write.",
          "I don't ask you to create an account, and the site doesn't collect anything else from you on purpose.",
        ],
      },
      {
        h: "How I use it",
        p: [
          "To read your message and reply to you. That's it. I don't sell your details, I don't add you to a mailing list, and I don't share them for advertising.",
        ],
      },
      {
        h: "Where it goes",
        p: [
          "Messages sent through the contact form travel to the site's server and are delivered to me, and may be kept there so I can answer. Like any website, the hosting provider keeps basic technical logs (for example IP address and time of visit) to keep the site running and secure.",
        ],
      },
      {
        h: "How long I keep it",
        p: [
          "Only as long as needed to reply and keep a sensible record of the conversation. If you'd like a message deleted sooner, just ask.",
        ],
      },
      {
        h: "Other sites",
        p: [
          "This site links to other places (Instagram, GitHub, LinkedIn, WhatsApp and the sites I've built). They have their own privacy policies, and I'm not responsible for what they do with your information.",
        ],
      },
      {
        h: "Your choices",
        p: [
          `You can ask me what I hold about you, ask me to correct it, or ask me to delete it, by emailing ${EMAIL}.`,
        ],
      },
      {
        h: "Changes",
        p: ["If this policy changes, the new version will appear on this page with a new date."],
      },
    ],
  },
  cookies: {
    kicker: "Legal",
    title: "Cookie policy",
    intro: "Cookies are small files a website can store in your browser. Here's how this portfolio treats them.",
    sections: [
      {
        h: "What this site does",
        p: [
          "This portfolio does not use cookies for tracking, analytics or advertising, and it doesn't show you a cookie banner because there's nothing to opt out of.",
        ],
      },
      {
        h: "Technical cookies",
        p: [
          "The hosting provider or your own browser may use small technical files or logs that are needed to deliver the site (for example, to load pages quickly and securely). These aren't used to follow you around the web.",
        ],
      },
      {
        h: "Third parties",
        p: [
          "Some assets, such as fonts, can be loaded from outside services, which can see basic details like your IP address when they do. And if you click through to Instagram, GitHub, LinkedIn or WhatsApp, those sites may set their own cookies under their own policies.",
        ],
      },
      {
        h: "Your control",
        p: [
          "You can view, block or delete cookies at any time in your browser's settings. Blocking cookies won't stop this site from working.",
        ],
      },
      {
        h: "If this changes",
        p: [
          "If I ever add analytics or anything else that uses cookies, I'll update this page first and ask for your consent where it's needed.",
        ],
      },
      {
        h: "Questions",
        p: [`Email me at ${EMAIL}.`],
      },
    ],
  },
};

export default function LegalPage({ kind }) {
  const page = PAGES[kind];
  const other = kind === "privacy" ? { href: "/cookies", label: "Cookie policy" } : { href: "/privacy", label: "Privacy policy" };
  const barRef = useRef(null);
  const [active, setActive] = useState(0);
  const [armed, setArmed] = useState(false);

  // Reading progress bar, the highlighted section in the contents list, and a
  // gentle fade-in for each section as it comes into view.
  useEffect(() => {
    setArmed(true);
    const els = page.sections.map((_, i) => document.getElementById(`lg-s-${i}`));
    let raf = null;
    function update() {
      raf = null;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0})`;
      let a = 0;
      els.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) a = i;
      });
      setActive(a);
    }
    function request() {
      if (raf === null) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12, rootMargin: "0px 0px -5% 0px" }
    );
    els.forEach((el) => el && io.observe(el));
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      io.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [kind]);

  function jump(i) {
    const el = document.getElementById(`lg-s-${i}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className={`lg-page ${armed ? "lg-armed" : ""}`}>
      <div className="lg-progress" aria-hidden="true">
        <div ref={barRef}></div>
      </div>
      <MenuOverlay />
      <div className="lg-glow" aria-hidden="true"></div>
      <header className="lg-hero">
        <a className="brand-dark" href="/" onClick={(e) => handleLinkClick(e, "/")}>
          M. IZZUDDIN
        </a>
        <div className="lg-hero-copy">
          <span className="lg-kicker">{page.kicker}</span>
          <h1>{page.title}</h1>
          <p>{page.intro}</p>
          <small>Last updated {UPDATED}</small>
        </div>
      </header>

      <div className="lg-body">
        <nav className="lg-toc" aria-label="On this page">
          <span>On this page</span>
          <ol>
            {page.sections.map((s, i) => (
              <li key={s.h}>
                <button type="button" className={i === active ? "on" : ""} onClick={() => jump(i)}>
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  {s.h}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <main className="lg-main">
          {page.sections.map((s, i) => (
            <div className="lg-block" id={`lg-s-${i}`} key={s.h}>
              <span className="lg-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h2>{s.h}</h2>
                {s.p.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </div>
            </div>
          ))}

          <div className="lg-foot">
            <a href="/" onClick={(e) => handleLinkClick(e, "/")}>
              <span aria-hidden="true">&lt;-</span> Back home
            </a>
            <a href={other.href} onClick={(e) => handleLinkClick(e, other.href)}>
              {other.label} <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </main>
      </div>
    </div>
  );
}