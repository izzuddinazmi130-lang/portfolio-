import { useState } from "react";
import { sendContactMessage } from "../api.js";
import MenuOverlay from "./MenuOverlay.jsx";
import SplitText from "./SplitText.jsx";
import { handleLinkClick } from "../navigate.js";

export default function ContactPage() {
  const EMPTY_FORM = { name: "", email: "", message: "", website: "" };
  const [form, setForm] = useState(EMPTY_FORM);
  // When the page opened - real people take more than a few seconds to write a message, bots don't.
  const [openedAt] = useState(() => Date.now());
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await sendContactMessage({ ...form, elapsedMs: Date.now() - openedAt });
      setStatus({ type: "success", text: "Message sent. I will get back to you soon." });
      setForm(EMPTY_FORM);
    } catch (err) {
      setStatus({ type: "error", text: err.message || "Something went wrong. Please email me directly instead." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <MenuOverlay />
      <div className="cp-page">
        <a className="cp-brand" href="/" onClick={(e) => handleLinkClick(e, "/")}>
          M. IZZUDDIN
        </a>
        <main className="cp-main">
          <div className="cp-layout">
            <aside className="cp-intro">
              <span className="cp-kicker">Have an idea?</span>
              <h1>
                <SplitText>Tell me what needs building.</SplitText>
              </h1>
              <p>
                Share the problem, the rough idea, or the system that is slowing your team down. A short brief is
                enough to start.
              </p>
              <div className="contact-brief-line"></div>
              <a className="cp-link" href="mailto:izzuddinazmi130@gmail.com">
                izzuddinazmi130@gmail.com
              </a>
              <a className="cp-link" href="tel:+60198158556">
                +6019 815 8556
              </a>
              <span className="cp-open">
                <i aria-hidden="true"></i> #OPENTOWORK
              </span>
            </aside>
          <form className="contact-page-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="contact-name">Your name</label>
              <input id="contact-name" name="name" value={form.name} onChange={handleChange} required placeholder="Jane Smith" />
            </div>
            <div className="form-field">
              <label htmlFor="contact-email">Email address</label>
              <input id="contact-email" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="jane@example.com" />
            </div>
            <div className="form-field">
              <label htmlFor="contact-message">What are you thinking about?</label>
              <textarea id="contact-message" name="message" rows="5" value={form.message} onChange={handleChange} required placeholder="A website, internal tool, booking system..." />
            </div>
            {/* Spam trap: hidden from people, but bots fill in every field they find. */}
            <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: "1px", height: "1px", overflow: "hidden" }}>
              <label htmlFor="contact-website">Leave this field empty</label>
              <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={handleChange} />
            </div>
            <button type="submit" disabled={submitting}>
              {submitting ? "Sending..." : "Send the brief"} <span aria-hidden="true">-&gt;</span>
            </button>
            {status && <div className={`form-status ${status.type}`}>{status.text}</div>}
          </form>
          </div>
        </main>
      </div>
    </>
  );
}