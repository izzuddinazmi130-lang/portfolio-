// Tiny client-side navigation helper. The site routes by window.location.pathname
// (see App.jsx), so going to another page is: change the URL, then tell App.jsx
// via a popstate event. Using this instead of a plain <a href> means moving
// between project pages doesn't reload the whole site.
export function navigate(to) {
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
  try {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  } catch (err) {
    window.scrollTo(0, 0);
  }
}

// For <a href="/somewhere"> links: normal clicks navigate in-app, but
// ctrl/cmd/shift/middle-click still open a new tab like a real link should.
export function handleLinkClick(e, to) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  navigate(to);
}