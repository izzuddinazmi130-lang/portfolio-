import { useEffect, useRef, useState } from "react";

// Counts up from 0 to `value` once, on mount. Used for the hero stat panel
// so the page feels alive without relying on scroll-triggered reveals.
export default function AnimatedNumber({ value, duration = 900, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);

  useEffect(() => {
    let frame;
    function step(timestamp) {
      if (!startRef.current) startRef.current = timestamp;
      const progress = Math.min((timestamp - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}