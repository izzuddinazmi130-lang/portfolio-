import { useEffect, useRef } from "react";
import SplitText from "./SplitText.jsx";

export default function Hero() {
  const photoRef = useRef(null);
  const heroRef = useRef(null);
  const marqueeWrapRef = useRef(null);
  const overlayRef = useRef(null);

  // Real scroll-driven effects (no click-to-scroll button):
  // - the photo drifts up, scales slightly, and fades as you scroll past it
  // - the marquee shifts extra distance based on scroll position, on top of its own loop
  // - a dark overlay gradually deepens, signalling more content is coming into view
  useEffect(() => {
    function onScroll() {
      const heroHeight = heroRef.current?.offsetHeight || 1;
      const y = window.scrollY;
      const progress = Math.min(y / heroHeight, 1);

      if (photoRef.current) {
        photoRef.current.style.transform = `translateY(${y * 0.18}px) scale(${1 + progress * 0.06})`;
        photoRef.current.style.opacity = String(1 - progress * 0.7);
      }
      if (marqueeWrapRef.current) {
        marqueeWrapRef.current.style.transform = "translateX(0)";
      }
      if (overlayRef.current) {
        overlayRef.current.style.opacity = String(progress * 0.55);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="hero-dark" ref={heroRef}>
      <div className="hero-dark-top">
        <div className="brand-dark">M. IZZUDDIN</div>
      </div>

      <div className="glow-blob hero-dark-glow"></div>

      <div className="hero-figure">
        <img ref={photoRef} src="/izz_portfolio2.png" alt="Muhammad Izzuddin" className="hero-dark-photo" />
        <div className="tagline-dark">
          <SplitText>Full-Stack</SplitText>
          <SplitText>Programmer &amp;</SplitText>
          <SplitText>Web Developer</SplitText>
        </div>
      </div>

      <div className="marquee" ref={marqueeWrapRef}>
        <div className="marquee-track">
          <span>MUHAMMAD IZZUDDIN&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          <span>MUHAMMAD IZZUDDIN&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          <span>MUHAMMAD IZZUDDIN&nbsp;&nbsp;•&nbsp;&nbsp;</span>
          <span>MUHAMMAD IZZUDDIN&nbsp;&nbsp;•&nbsp;&nbsp;</span>
        </div>
      </div>

      <div className="hero-dark-overlay" ref={overlayRef}></div>
    </section>
  );
}