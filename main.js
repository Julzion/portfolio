/* Brian Jules C. Asuncion — portfolio scripts */
const EMAIL = "brianjulesasuncion@gmail.com";

document.documentElement.classList.add("js");
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- Theme ---------- */
const root = document.documentElement;
$(".theme-btn").addEventListener("click", () => {
  const cur = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = cur === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
});

/* ---------- Mobile menu ---------- */
const side = $(".side");
const menuBtn = $(".side__menu");
function setMenu(open) {
  side.classList.toggle("is-open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuBtn.addEventListener("click", () => setMenu(!side.classList.contains("is-open")));
$$(".side__nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- Active section in sidebar ---------- */
const navLinks = $$(".side__nav a");
const spy = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle("is-active", a.hash === "#" + en.target.id));
  });
}, { rootMargin: "-40% 0px -55% 0px" });
$$("main section[id]").forEach((s) => spy.observe(s));

/* ---------- Reveal ---------- */
const rev = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); rev.unobserve(en.target); } });
}, { threshold: 0.1 });
$$(".reveal").forEach((el) => rev.observe(el));

/* ---------- Skill tabs ---------- */
const tabs = $$('[role="tab"]');
function selectTab(tab) {
  tabs.forEach((t) => {
    const on = t === tab;
    t.setAttribute("aria-selected", String(on));
    t.tabIndex = on ? 0 : -1;
    document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
  });
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", (e) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    const next = tabs[(i + dir + tabs.length) % tabs.length];
    selectTab(next);
    next.focus();
  });
});

/* ---------- Project filter ---------- */
$$(".filters button").forEach((btn) => {
  btn.addEventListener("click", () => {
    $$(".filters button").forEach((b) => { b.classList.toggle("is-on", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    const f = btn.dataset.filter;
    $$(".pcard").forEach((card) => { card.hidden = f !== "all" && card.dataset.cat !== f; });
  });
});

/* ---------- Project details dialogs ---------- */
$$("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const dlg = document.getElementById(btn.dataset.open);
    dlg.showModal();
    $(".pd__body", dlg).scrollTop = 0;
  });
});
$$(".pd").forEach((dlg) => {
  $(".pd__close", dlg).addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
});

/* ---------- Image zoom ---------- */
const zoom = $("#zoom");
const zoomImg = $("img", zoom);
$$("[data-zoom]").forEach((btn) => {
  btn.addEventListener("click", () => {
    zoomImg.src = btn.dataset.zoom;
    zoomImg.alt = $("img", btn)?.alt || "";
    zoom.showModal();
  });
});
$(".zoom__close").addEventListener("click", () => zoom.close());
zoom.addEventListener("click", (e) => { if (e.target !== zoomImg) zoom.close(); });

/* ---------- Contact form (opens email app) ---------- */
$("#msgForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target.elements;
  const name = f.namedItem("name").value.trim();
  const subject = f.namedItem("subject").value.trim();
  const message = f.namedItem("message").value.trim();
  const out = $("#formMsg");
  if (!name || !subject || !message) {
    out.textContent = "Please fill in your name, a subject and a message.";
    return;
  }
  out.textContent = "";
  const body = `${message}\n\n— ${name}`;
  location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* ---------- Year ---------- */
$(".js-year").textContent = new Date().getFullYear();
