/* ==========================================================
   CONTACT DETAILS — edit these, then redeploy.
   Leave a value as "" to show it as "to be added".
   ========================================================== */
const CONTACT = {
  email: "",     // e.g. "brian@example.com"
  phone: "",     // e.g. "+63 912 345 6789"
  github: "",    // e.g. "https://github.com/username"
  linkedin: "",  // e.g. "https://www.linkedin.com/in/username"
};

document.documentElement.classList.add("js");

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Theme toggle ---------- */
const root = document.documentElement;
$(".theme-btn").addEventListener("click", () => {
  const current = root.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const next = current === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
});

/* ---------- Mobile menu ---------- */
const burger = $(".nav__burger");
const menu = $(".menu");
function setMenu(open) {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.hidden = !open;
  document.body.style.overflow = open ? "hidden" : "";
}
burger.addEventListener("click", () => setMenu(menu.hidden));
$$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });

/* ---------- Scroll progress + nav state ---------- */
const nav = $(".nav");
const bar = $(".progress");
function onScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  nav.classList.toggle("is-scrolled", scrollY > 10);
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Active nav link ---------- */
const navLinks = $$(".nav__links a");
const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) {
      navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + en.target.id));
    }
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((s) => sectionObs.observe(s));

/* ---------- Reveal on scroll ---------- */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("is-in"); revealObs.unobserve(en.target); }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal").forEach((el) => revealObs.observe(el));

/* ---------- Counters ---------- */
const countObs = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    const el = en.target;
    const end = Number(el.dataset.count);
    countObs.unobserve(el);
    if (reduceMotion) return;
    const t0 = performance.now();
    const dur = 1200;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.6 });
$$("[data-count]").forEach((el) => countObs.observe(el));

/* ---------- Typed roles ---------- */
const typed = $(".typed");
const roles = ["a BSIT student", "a web developer", "EmploySmart's co-developer", "detail-oriented with data", "ready for OJT"];
if (typed && !reduceMotion) {
  let r = 0, i = roles[0].length, deleting = true;
  const step = () => {
    const word = roles[r];
    i += deleting ? -1 : 1;
    typed.textContent = word.slice(0, i);
    let delay = deleting ? 40 : 75;
    if (!deleting && i === word.length) { deleting = true; delay = 1800; }
    else if (deleting && i === 0) { deleting = false; r = (r + 1) % roles.length; delay = 300; }
    setTimeout(step, delay);
  };
  setTimeout(step, 1800);
}

/* ---------- Lightbox ---------- */
const lb = $(".lightbox");
const lbImg = $("img", lb);
const lbCap = $(".lightbox__cap", lb);
let lastFocus = null;
function openLightbox(src, alt) {
  lastFocus = document.activeElement;
  lbImg.src = src;
  lbImg.alt = alt || "";
  lbCap.textContent = alt || "";
  lb.hidden = false;
  document.body.style.overflow = "hidden";
  $(".lightbox__close").focus();
}
function closeLightbox() {
  lb.hidden = true;
  lbImg.removeAttribute("src");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus();
}
$$("[data-full]").forEach((btn) => {
  btn.addEventListener("click", () => openLightbox(btn.dataset.full, $("img", btn)?.alt));
});
lb.addEventListener("click", (e) => { if (e.target !== lbImg) closeLightbox(); });
addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLightbox(); });

/* ---------- Toast ---------- */
const toast = $(".toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-on"), 2200);
}

/* ---------- Contact links ---------- */
const ICONS = {
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3h3l1.5 4.5-2 1.3a12 12 0 0 0 6.1 6.1l1.3-2L21 14.4v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.6 5.2 2 2 0 0 1 6.6 3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.6 18.3 5 18.3 5c.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.16-.02-2.64-1.6-2.64-1.62 0-1.86 1.26-1.86 2.56v4.92h-4v-11Z"/></svg>',
};
const LABELS = { email: "Email", phone: "Phone", github: "GitHub", linkedin: "LinkedIn" };

const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const prettyUrl = (u) => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const contactBox = $("[data-contact]");
Object.keys(LABELS).forEach((key) => {
  const value = (CONTACT[key] || "").trim();
  const inner = (sub) => `<span class="clink__icon">${ICONS[key]}</span><span><b>${LABELS[key]}</b><small>${sub}</small></span>`;
  let el;
  if (!value) {
    el = document.createElement("div");
    el.className = "clink clink--empty";
    el.innerHTML = inner("To be added");
  } else if (key === "email") {
    el = document.createElement("button");
    el.type = "button";
    el.className = "clink";
    el.innerHTML = inner(escapeHtml(value) + " · click to copy");
    el.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(value); showToast("Email copied to clipboard"); }
      catch (e) { location.href = "mailto:" + value; }
    });
  } else {
    el = document.createElement("a");
    el.className = "clink";
    el.href = key === "phone" ? "tel:" + value.replace(/[^\d+]/g, "") : value;
    if (key !== "phone") { el.target = "_blank"; el.rel = "noopener"; }
    el.innerHTML = inner(escapeHtml(key === "phone" ? value : prettyUrl(value)));
  }
  contactBox.appendChild(el);
});

/* ---------- Year ---------- */
$(".js-year").textContent = new Date().getFullYear();
