import { useEffect, useRef, useState } from "react";

// Below this viewport width (px), the whole effect is skipped entirely and
// the page behaves like a normal, plainly-scrolling site - this kind of
// scroll-driven motion tends to fight touch scrolling and feel clunky on
// small screens rather than adding anything.
const MOBILE_BREAKPOINT_PX = 768;

// Where the square starts, as an offset from dead-center of the screen (in
// vw/vh, so it scales with viewport size) - "left of the hero photo, a
// little above center". Nudge if it doesn't line up with your photo.
const START_OFFSET_X_VW = -30;
const START_OFFSET_Y_VH = -10;

// Where it settles before expanding, and stays anchored while it grows.
// The actual X position is computed live in getEndOffsetPx below (measured
// against the real heading text, with a minimum distance from center) -
// not a fixed percentage, which looked right on one screen size and either
// crowded the text or drifted toward the middle on another.

// The symbol's resting size scales with the viewport (using the smaller of
// width/height, so it stays proportional regardless of aspect ratio)
// instead of a fixed pixel size. The min/max here are just safety rails for
// extreme cases (a tiny window, an 8K display) - they're deliberately wide
// so any normal laptop or monitor screen stays in the pure-proportional
// zone in between, rather than getting floored/ceilinged to a fixed size
// and ending up looking like a different ratio on different screens.
// Mirrors the clamp() used as the CSS fallback default for .scroll-symbol -
// keep both in sync.
const BASE_SIZE_MIN = 32;
const BASE_SIZE_MAX = 96;
const BASE_SIZE_VIEWPORT_RATIO = 0.05;

function getBaseSize() {
  const reference = Math.min(window.innerWidth, window.innerHeight);
  return Math.min(Math.max(reference * BASE_SIZE_VIEWPORT_RATIO, BASE_SIZE_MIN), BASE_SIZE_MAX);
}

// Thickness (px) of the X/+ cross's two bars while it's still just a mark -
// thin and interesting, not a solid block. Kept proportional to the resting
// size above (see getCrossThickness) rather than a fixed pixel value, and
// solidifies into a plain filled square only once expanding (see
// SOLIDIFY_RATE below).
const CROSS_THICKNESS_RATIO = 0.1;
const CROSS_THICKNESS_MIN = 3;

function getCrossThickness() {
  return Math.max(getBaseSize() * CROSS_THICKNESS_RATIO, CROSS_THICKNESS_MIN);
}

// How many full extra rotations it spins through over the whole journey
// (on top of the 45deg needed to turn an X into a +). Tied directly to
// scroll position, not time - so scrolling up spins it back the other way
// for free, with no separate "direction" logic needed anywhere.
const SPIN_TURNS = 2;

// Once expanding, how quickly the cross solidifies into a filled square,
// as a multiplier on `expand` - e.g. 6 means it's fully solid by the time
// expand reaches 1/6, so it reads as "briefly a plus, then solid" rather
// than a giant thin cross growing to fill the screen.
const SOLIDIFY_RATE = 6;

// How much accumulated wheel/touch delta (px) it takes to fully grow the
// square from small to fullscreen (or shrink it back down). Bigger = slower.
const EXPAND_DISTANCE = 650;

// How quickly the displayed size eases toward its target, expressed as the
// fraction of the remaining gap closed per 60fps frame (0-1). Higher =
// snappier, lower = floatier. It's applied time-based in tick() (scaled by
// the real frame delta), so it feels identical on 60Hz, 120Hz and 144Hz
// screens instead of being twice as snappy on a high-refresh monitor.
// Purely cosmetic - see note below.
const EASE = 0.16;

// How long (ms) it stays fully covering the screen, motionless, before
// unlocking - a brief "yes, this is the new screen" beat. Scrolling down at
// all during this skips the wait; scrolling up cancels it and shrinks back
// down instead.
const HOLD_MS = 350;

// Once unlocked, Systems and everything after it simply scroll up from below
// the bottom edge of the screen over the full-screen square - no scripted
// movement involved, just the page's own native scrolling (which the browser
// handles on the compositor, so it's as smooth as scrolling gets). The lock
// engages at the exact moment the top of Systems sits on the bottom edge of
// the viewport, and unlocking leaves the page right there instead of jumping
// forward.
//
// The square then stays as a backdrop until Systems has scrolled up past the
// top of the screen (this many viewport-heights of scrolling past the unlock
// point - a little over 1 so the intro section is comfortably off-screen
// before anything starts fading). It fades OUT softly, but comes back
// INSTANTLY when scrolling back up (see setBackdropHidden) - a slow fade-in
// would let the intro/stats sections show through for a split second.
const BACKDROP_HIDE_VH = 1.1;
const BACKDROP_FADE_OUT = "opacity .45s ease";

// How far short of the exact lock-trigger threshold a full reverse lands,
// in px. Needs to be more than a hair's width: landing essentially exactly
// on the boundary risked residual scroll momentum (a couple of stray px)
// immediately re-triggering the lock right on the spot, which would feel
// like getting stuck flickering at that exact point.
const REVERSE_LANDING_MARGIN = 24;

// Live-measured point just to the right of the actual heading text, so the
// symbol's resting/expand spot stays clear of it regardless of how the text
// wraps on any given screen - not a blind percentage of the viewport, which
// looks right on one screen size and ends up crowding the text on another
// (e.g. a laptop where the heading wraps wider relative to the viewport
// than it does on a large monitor). It's also never allowed to sit closer
// than MIN_OFFSET_FROM_CENTER_RATIO to dead-center: on a wide monitor the
// text column is capped (doesn't keep growing with the screen), so "just
// past the heading" can end up being less than half the viewport width,
// which without this floor would pull the resting spot toward the middle
// of the screen instead of staying clearly off to the side.
const MIN_OFFSET_FROM_CENTER_RATIO = 0.15;

// How far below dead-center (vertically) it settles, as a ratio of viewport
// height - scales with screen size on purpose, so it sits further down on
// a tall monitor than it does on a shorter laptop screen. On top of that,
// screens taller than TALL_SCREEN_BASELINE_PX (roughly a typical laptop's
// height) get an extra proportional push further down - so a monitor sits
// noticeably lower than a plain linear scale-up would put it, while a
// laptop around or under that baseline is unaffected.
const END_OFFSET_Y_RATIO = 0.08;
const TALL_SCREEN_BASELINE_PX = 900;
const TALL_SCREEN_EXTRA_RATIO = 2.5;

function getEndOffsetPx(introEl) {
  const size = getBaseSize();
  const centerX = window.innerWidth / 2;
  const gap = Math.max(window.innerWidth * 0.035, 28);
  const minX = centerX + window.innerWidth * MIN_OFFSET_FROM_CENTER_RATIO;
  const maxX = window.innerWidth - (size / 2 + 20);

  const heading = introEl ? introEl.querySelector("h1") : null;
  const clearOfText = heading ? heading.getBoundingClientRect().right + gap + size / 2 : minX;

  // Whichever requirement pushes it further right wins - clearing the text
  // and never sitting too close to center are both hard requirements, not
  // just one or the other.
  const targetX = Math.min(Math.max(clearOfText, minX), maxX);
  const excessHeight = Math.max(0, window.innerHeight - TALL_SCREEN_BASELINE_PX);
  const targetY = window.innerHeight * END_OFFSET_Y_RATIO + excessHeight * TALL_SCREEN_EXTRA_RATIO;
  return { x: targetX - centerX, y: targetY };
}

// travel 0 -> 0.5: moves straight down (Y only). travel 0.5 -> 1: moves
// straight right (X only) - an L-shaped path rather than a diagonal one.
// Works in real px throughout (not vw/vh) so it can interpolate toward the
// live-measured end point above.
function idleState(travel, introEl) {
  const startX = window.innerWidth * (START_OFFSET_X_VW / 100);
  const startY = window.innerHeight * (START_OFFSET_Y_VH / 100);
  const end = getEndOffsetPx(introEl);
  if (travel <= 0.5) {
    const p = travel / 0.5;
    return { x: startX, y: startY + (end.y - startY) * p };
  }
  const p = (travel - 0.5) / 0.5;
  return { x: startX + (end.x - startX) * p, y: end.y };
}

/**
 * Renders the rest of the page (`children`) right where it's placed, plus a
 * small thin X-mark (two crossed bars, not a filled shape) that lives in
 * the hero from the very start and:
 *
 *  1) moves straight down, then straight right (not diagonally), while
 *     continuously spinning - tied directly to scroll position, so
 *     scrolling up spins it the opposite way for free - landing exactly on
 *     a +-orientation right as it arrives at the lock point.
 *  2) once the intro section is fully in view, the page genuinely LOCKS -
 *     it cannot be scrolled any further - and further scroll/wheel/touch
 *     input instead grows it (real width/height, not a blurry CSS
 *     `scale()`), solidifying from a thin + into a filled square early in
 *     the growth, then continuing to grow until it fully covers the screen.
 *  3) it then holds there, fully covering the screen, briefly.
 *  4) the page unlocks right where it was (Systems sits just below the
 *     bottom edge of the screen) and normal scrolling takes over. The square
 *     stays exactly as it was - a persistent backdrop, not a one-shot reveal
 *     - while Systems and the rest of the page scroll up from below the
 *     screen over it, naturally, at normal scroll speed. Once Systems has
 *     reached the top of the screen the square fades out, since by then
 *     there's nothing left for it to back.
 *
 * Scrolling back up reverses step 4 for free (it's just a plain function of
 * scroll position, so there's nothing to "undo"), and re-triggers the lock
 * once you scroll back up past where it originally engaged, reversing 3-1
 * the same way (unsolidifying back into a thin, spinning X as it glides
 * back right-then-down to its resting spot in the hero).
 *
 * Skipped entirely - `children` just render normally - below
 * MOBILE_BREAKPOINT_PX and for prefers-reduced-motion.
 *
 * A note on the easing in tick(): it's only ever applied to *how something
 * is drawn*, never to *when a phase transition happens* while the page is
 * unlocked - the one exception (the "expanding" branch) is safe by
 * construction, since the page is genuinely locked and every input event is
 * prevented during that phase, so there's no real scroll to outrun.
 */
export default function ScrollRevealSymbol({ introRef, children }) {
  const symbolRef = useRef(null);
  const barHRef = useRef(null);
  const barVRef = useRef(null);
  const [enabled] = useState(() => {
    if (typeof window === "undefined") return false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth <= MOBILE_BREAKPOINT_PX;
    return !reduceMotion && !isMobile;
  });

  // Phones / small windows get a different, scroll-linked treatment instead of
  // the lock-and-expand one (which fights touch scrolling):
  //  - section headings that fill from faint outline to solid ink as they
  //    pass through the screen (--fill),
  //  - cards that flip up out of the page in 3D as they arrive (--mt/--my/--mo).
  const contentRef = useRef(null);
  const [mobileFx] = useState(() => {
    if (typeof window === "undefined") return false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return !reduceMotion && window.innerWidth <= MOBILE_BREAKPOINT_PX;
  });

  useEffect(() => {
    if (!mobileFx) return;
    const root = document.documentElement;
    const wrap = contentRef.current;
    if (!wrap) return;
    root.classList.add("has-mobile-fx");
    const clamp01 = (n) => Math.min(1, Math.max(0, n));
    const smooth = (t) => t * t * (3 - 2 * t);
    let raf = null;
    function update() {
      raf = null;
      const vh = window.innerHeight;

      const heads = wrap.querySelectorAll("h2, .section-head h2, #contact h3");
      const cards = wrap.querySelectorAll(".tile, .xp-item, .also-item");
      const headTops = Array.from(heads, (el) => el.getBoundingClientRect().top);
      const cardTops = Array.from(cards, (el) => el.getBoundingClientRect().top);

      heads.forEach((el, i) => {
        const f = clamp01((vh * 0.92 - headTops[i]) / (vh * 0.42));
        el.style.setProperty("--fill", `${(f * 100).toFixed(1)}%`);
      });
      cards.forEach((el, i) => {
        const t = smooth(clamp01((vh - cardTops[i]) / (vh * 0.5)));
        el.style.setProperty("--mt", `${((1 - t) * 38).toFixed(1)}deg`);
        el.style.setProperty("--my", `${((1 - t) * 44).toFixed(1)}px`);
        el.style.setProperty("--mo", (0.08 + 0.92 * t).toFixed(3));
      });
    }
    function request() {
      if (raf === null) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    const late = setTimeout(request, 400); // content (images/data) may shift layout
    return () => {
      window.removeEventListener("scroll", request);
      window.removeEventListener("resize", request);
      clearTimeout(late);
      if (raf !== null) cancelAnimationFrame(raf);
      root.classList.remove("has-mobile-fx");
    };
  }, [mobileFx]);

  useEffect(() => {
    if (!enabled) return;
    const symbol = symbolRef.current;
    const barH = barHRef.current;
    const barV = barVRef.current;
    if (!symbol || !barH || !barV) return;

    // Lets the stylesheet know the rising-from-below reveal is in charge of
    // the Systems section (so its own fade-in/slide-in doesn't stack on top).
    document.documentElement.classList.add("has-scroll-reveal");

    const state = {
      phase: "idle", // idle -> expanding -> held -> revealed -> (expanding, reverse) -> idle
      travelTarget: 0,
      travelDisplayed: 0,
      expandTarget: 0,
      expandDisplayed: 0,
      hasExpanded: false,
      frozenScrollY: 0,
      revealScrollY: 0,
      lastScrollY: window.scrollY,
      holdTimer: null,
    };
    let rafId = null;

    function coverSide() {
      // Generously oversized on purpose, since it's anchored off-center
      // rather than dead-center - guarantees full coverage with margin to
      // spare rather than just barely reaching the edges.
      return Math.max(window.innerWidth, window.innerHeight) * 2.5;
    }

    function setBarThickness(px) {
      barH.style.height = `${px}px`;
      barV.style.width = `${px}px`;
    }

    function paintIdle(travel) {
      const s = idleState(travel, introRef.current);
      // Starts on an X (45deg) and spins continuously as travel increases,
      // landing on an exact multiple of 360deg (visually identical to 0deg,
      // i.e. a +) right as travel reaches 1. Tied directly to travel, not
      // time, so scrolling up simply decreases this and it spins the other
      // way - no separate "direction" logic needed.
      const rotate = 45 + travel * (SPIN_TURNS * 360 - 45);
      const size = getBaseSize();
      symbol.style.width = `${size}px`;
      symbol.style.height = `${size}px`;
      symbol.style.transform = `translate(-50%,-50%) translate(${s.x}px, ${s.y}px) rotate(${rotate}deg)`;
      symbol.style.opacity = "1";
      setBarThickness(getCrossThickness());
    }

    function paintExpand(expand) {
      const base = getBaseSize();
      const side = base + expand * (coverSide() - base);
      const end = getEndOffsetPx(introRef.current);
      symbol.style.width = `${side}px`;
      symbol.style.height = `${side}px`;
      // No rotation term here - it stays wherever paintIdle left it (an
      // exact multiple of 360deg, i.e. visually a plain +/square), so there
      // is no seam between "just arrived, spinning stops" and "starts
      // solidifying" - it just looks like it settles and holds still.
      symbol.style.transform = `translate(-50%,-50%) translate(${end.x}px, ${end.y}px)`;
      symbol.style.opacity = "1";
      // Solidifies from a thin + into a filled square early in the growth,
      // then keeps tracking `side` exactly (fully solid) for the rest of it.
      const solidify = Math.min(expand * SOLIDIFY_RATE, 1);
      const thin = getCrossThickness();
      setBarThickness(thin + (side - thin) * solidify);
    }

    // Hiding the backdrop can take its time (the sections above Systems are
    // already scrolled out of view by then), but showing it again must be
    // instant: it has to be fully opaque the very frame the intro/stats
    // sections start coming back into view, or they flash through a
    // half-faded square.
    let backdropHidden = false;
    function setBackdropHidden(hidden) {
      if (hidden === backdropHidden) return;
      backdropHidden = hidden;
      symbol.style.transition = hidden ? BACKDROP_FADE_OUT : "none";
      symbol.style.opacity = hidden ? "0" : "1";
    }

    function lockBodyAt(scrollY) {
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add("scroll-locked");
      document.documentElement.classList.add("scroll-locked");
    }

    // Freezing the page via position:fixed makes the browser's real scroll
    // position quietly settle to 0 while frozen (there's nothing to scroll,
    // by design). Restoring it explicitly here is what makes unlocking
    // resume from the right place instead of snapping back to the top of
    // the page - and it must be instant: this site sets
    // `scroll-behavior:smooth` on <html> globally, which would otherwise
    // animate this scroll, firing a cascade of intermediate scroll events
    // that can misfire other logic watching scroll position.
    function unlockBody(restoreScrollY) {
      document.body.classList.remove("scroll-locked");
      document.documentElement.classList.remove("scroll-locked");
      document.body.style.top = "";
      if (typeof restoreScrollY === "number") {
        try {
          window.scrollTo({ top: restoreScrollY, left: 0, behavior: "instant" });
        } catch (err) {
          window.scrollTo(0, restoreScrollY);
        }
      }
    }

    function clearHoldTimer() {
      if (state.holdTimer) {
        clearTimeout(state.holdTimer);
        state.holdTimer = null;
      }
    }

    function finishAndReveal() {
      clearHoldTimer();
      state.phase = "revealed";
      // Unlock exactly where the lock engaged: the top of Systems is sitting
      // on the bottom edge of the screen, hidden behind the full-screen
      // square. No scroll jump - the next bit of scrolling just carries
      // Systems up into view from below.
      unlockBody(state.revealScrollY);
      // Stays fully visible - it's a persistent backdrop now, not a
      // one-shot reveal. Systems (rendered above it - see .scroll-reveal-
      // content's z-index) scrolls up over it; the square itself only fades
      // once Systems has reached the top of the screen.
      paintExpand(1);
      setBackdropHidden(false);
      symbol.style.opacity = "1";
    }

    function startHold() {
      clearHoldTimer();
      state.phase = "held";
      state.holdTimer = setTimeout(finishAndReveal, HOLD_MS);
    }

    function bumpExpandTarget(delta) {
      state.expandTarget = Math.min(Math.max(state.expandTarget + delta / EXPAND_DISTANCE, 0), 1);
      if (state.expandTarget > 0) {
        // Only once the square has genuinely started growing is it valid to
        // treat "back down to 0" as the user deliberately reversing.
        // Without this, the very moment of freshly locking - where both the
        // target and displayed size legitimately start at exactly 0 -
        // satisfies that same "shrunk back to nothing" condition on the
        // next frame and instantly un-locks before any real growth happens.
        state.hasExpanded = true;
      }
    }

    let lastFrameTime = performance.now();

    function tick(now) {
      // Time-based easing: the same feel regardless of refresh rate, and a
      // dropped frame catches up proportionally instead of visibly stalling.
      // Capped so a backgrounded tab resuming doesn't make it jump.
      const dt = Math.min(Math.max(now - lastFrameTime, 1), 50);
      lastFrameTime = now;
      const ease = 1 - Math.pow(1 - EASE, dt / 16.667);

      if (state.phase === "idle") {
        state.travelDisplayed += (state.travelTarget - state.travelDisplayed) * ease;
        if (Math.abs(state.travelTarget - state.travelDisplayed) < 0.0015) {
          state.travelDisplayed = state.travelTarget;
        }
        paintIdle(state.travelDisplayed);
      } else if (state.phase === "expanding") {
        state.expandDisplayed += (state.expandTarget - state.expandDisplayed) * ease;
        if (Math.abs(state.expandTarget - state.expandDisplayed) < 0.0015) {
          state.expandDisplayed = state.expandTarget;
        }
        paintExpand(state.expandDisplayed);
        // Safe to gate on the eased value here (unlike the lock-trigger in
        // onScrollIdle): the page is already fully locked and every input
        // event is prevented, so there's no real scroll that could "outrun"
        // this - waiting for the visual to actually finish before treating
        // it as complete is simply correct, not risky.
        if (state.expandTarget >= 1 && state.expandDisplayed >= 0.999) {
          startHold();
        } else if (state.hasExpanded && state.expandTarget <= 0 && state.expandDisplayed <= 0.001) {
          state.phase = "idle";
          // Nudged short of the exact lock threshold (see
          // REVERSE_LANDING_MARGIN) rather than landing exactly on it -
          // landing right on the boundary pixel risked stray residual
          // scroll momentum immediately re-triggering the lock on the spot,
          // making it feel stuck flickering right where it should have
          // smoothly handed back to normal scrolling.
          unlockBody(Math.max(state.frozenScrollY - REVERSE_LANDING_MARGIN, 0));
        }
      }
      rafId = requestAnimationFrame(tick);
    }

    function onScrollIdle() {
      const currentScrollY = window.scrollY;
      // Only ever treat this as "the user scrolled up" when the position
      // actually decreased since the last time we checked - matters because
      // unlockBody()'s scrollTo() fires its own scroll event, which could
      // otherwise be mistaken for a genuine upward scroll.
      const scrolledUp = currentScrollY < state.lastScrollY;
      state.lastScrollY = currentScrollY;

      if (state.phase === "idle") {
        const introEl = introRef.current;
        if (!introEl) return;
        // Recomputed fresh every time - never cached - so a layout shift
        // from late-loading fonts/images can't leave this pointing at a
        // stale, too-small distance.
        const introRect = introEl.getBoundingClientRect();
        const introEnd = currentScrollY + introRect.bottom;
        const viewport = window.innerHeight;
        const denom = Math.max(introEnd - viewport, 1);
        const progress = Math.min(Math.max(currentScrollY / denom, 0), 1);
        state.travelTarget = progress;
        // This must fire the instant the real scroll position crosses the
        // threshold - a raw, instantly-updated value, never gated on the
        // eased travelDisplayed - or a fast scroll/flick keeps going past
        // the point it should have locked.
        if (progress >= 1) {
          state.phase = "expanding";
          state.expandTarget = 0;
          state.expandDisplayed = 0;
          state.hasExpanded = false;
          state.frozenScrollY = currentScrollY;
          // Unlock back at this same scroll position (see finishAndReveal) -
          // here the top of Systems is exactly on the bottom screen edge.
          state.revealScrollY = currentScrollY;
          state.travelDisplayed = 1;
          lockBodyAt(state.frozenScrollY);
        }
        return;
      }

      if (state.phase !== "revealed") return;

      const pastReveal = currentScrollY - state.revealScrollY;
      if (pastReveal <= 0) {
        // Back at (or above) the unlock point - Systems is off-screen below
        // again. Continuing up from here is a genuine attempt to go back
        // past this point.
        setBackdropHidden(false);
        if (scrolledUp) {
          // Re-lock, fully covering again (bring the square back at full
          // opacity/size - it's already sized correctly from before, just
          // hidden), then let further upward input shrink it back down
          // exactly like the forward direction in reverse.
          state.phase = "expanding";
          state.expandTarget = 1;
          state.expandDisplayed = 1;
          state.hasExpanded = true;
          symbol.style.opacity = "1";
          lockBodyAt(state.frozenScrollY);
        }
        return;
      }

      // Nothing to animate by hand here - Systems is rising purely because
      // the page is scrolling, and scrolling back up just reverses it. All
      // that's left is the backdrop: it stays for as long as there's still a
      // gap above the rising content, fades out softly once Systems has
      // scrolled up past the top of the screen, and snaps back the instant
      // you scroll back above that point.
      const hideAt = BACKDROP_HIDE_VH * window.innerHeight;
      setBackdropHidden(pastReveal >= hideAt);
    }

    function onWheel(e) {
      if (state.phase === "expanding") {
        e.preventDefault();
        bumpExpandTarget(e.deltaY);
      } else if (state.phase === "held") {
        // Consume the event either way so the browser doesn't show a
        // rubber-band bounce trying (and failing) to scroll a locked page.
        e.preventDefault();
        if (e.deltaY < 0) {
          state.phase = "expanding";
          clearHoldTimer();
          bumpExpandTarget(e.deltaY);
        } else if (e.deltaY > 0) {
          // Don't make the pause a dead zone - continuing to scroll down
          // unlocks immediately instead of waiting out the timer.
          finishAndReveal();
        }
      }
    }

    let touchStartY = 0;
    function onTouchStart(e) {
      touchStartY = e.touches[0].clientY;
    }
    function onTouchMove(e) {
      const currentY = e.touches[0].clientY;
      const delta = touchStartY - currentY;
      if (state.phase === "expanding") {
        e.preventDefault();
        bumpExpandTarget(delta);
        touchStartY = currentY;
      } else if (state.phase === "held") {
        e.preventDefault();
        if (delta < 0) {
          state.phase = "expanding";
          clearHoldTimer();
          bumpExpandTarget(delta);
          touchStartY = currentY;
        } else if (delta > 0) {
          finishAndReveal();
          touchStartY = currentY;
        }
      }
    }

    // Wheel/touch aren't the only way people scroll - the scrollbar, arrow
    // keys, Page Up/Down, Space, and Home/End all move the page too, none
    // of which fire wheel/touch events. Without this, once locked, any of
    // those inputs would do nothing at all - it'd just sit there frozen.
    const KEY_DELTA = {
      ArrowDown: 80,
      PageDown: 400,
      " ": 400,
      Spacebar: 400,
      End: 2000,
      ArrowUp: -80,
      PageUp: -400,
      Home: -2000,
    };
    function onKeyDown(e) {
      const delta = KEY_DELTA[e.key];
      if (delta === undefined) return;
      if (state.phase === "expanding") {
        e.preventDefault();
        bumpExpandTarget(delta);
      } else if (state.phase === "held") {
        e.preventDefault();
        if (delta < 0) {
          state.phase = "expanding";
          clearHoldTimer();
          bumpExpandTarget(delta);
        } else if (delta > 0) {
          finishAndReveal();
        }
      }
    }

    window.addEventListener("scroll", onScrollIdle, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown, { passive: false });
    onScrollIdle();
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScrollIdle);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
      if (rafId) cancelAnimationFrame(rafId);
      clearHoldTimer();
      document.documentElement.classList.remove("has-scroll-reveal");
      unlockBody(state.phase === "idle" || state.phase === "revealed" ? undefined : state.frozenScrollY);
    };
  }, [introRef, enabled]);

  return (
    <>
      {enabled && (
        <div className="scroll-symbol" ref={symbolRef} aria-hidden="true">
          <div className="scroll-symbol-bar scroll-symbol-bar-h" ref={barHRef} />
          <div className="scroll-symbol-bar scroll-symbol-bar-v" ref={barVRef} />
        </div>
      )}
      <div className="scroll-reveal-content" ref={contentRef}>
        {children}
      </div>
    </>
  );
}