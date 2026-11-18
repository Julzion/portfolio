// TaskFlow: a simple drag-and-drop task board
// Tasks are stored in localStorage so they stay after a page refresh.

const KEY = "taskflow.tasks";
const ORDER = ["todo", "doing", "done"];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* ignore and use samples */ }
  const d = (offset) => { const t = new Date(); t.setDate(t.getDate() + offset); return t.toISOString().slice(0, 10); };
  return [
    { id: uid(), title: "Finish capstone documentation", prio: "high", due: d(3), status: "doing" },
    { id: uid(), title: "Review SQL joins for quiz", prio: "medium", due: d(5), status: "todo" },
    { id: uid(), title: "Update portfolio screenshots", prio: "low", due: "", status: "todo" },
    { id: uid(), title: "Prepare OJT requirements", prio: "high", due: d(-1), status: "todo" },
    { id: uid(), title: "Complete JobReady module", prio: "medium", due: "", status: "done" },
  ];
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(tasks)); } catch (e) { /* storage unavailable */ }
}
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let tasks = load();

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function isLate(t) {
  if (!t.due || t.status === "done") return false;
  const today = new Date().toISOString().slice(0, 10);
  return t.due < today;
}
function fmtDate(s) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

function cardHtml(t) {
  const i = ORDER.indexOf(t.status);
  return `<li class="card" draggable="true" data-id="${t.id}" data-prio="${t.prio}">
    <p class="card__title">${escapeHtml(t.title)}</p>
    <div class="card__meta">
      <span class="tag ${t.prio === "high" ? "tag--high" : ""}">${t.prio}</span>
      ${t.due ? `<span class="tag ${isLate(t) ? "tag--late" : ""}">${isLate(t) ? "Overdue · " : "Due "}${fmtDate(t.due)}</span>` : ""}
      <span class="card__btns">
        <button type="button" data-move="-1" aria-label="Move left" ${i === 0 ? "disabled" : ""}>←</button>
        <button type="button" data-move="1" aria-label="Move right" ${i === ORDER.length - 1 ? "disabled" : ""}>→</button>
        <button type="button" class="del" data-del aria-label="Delete task">✕</button>
      </span>
    </div>
  </li>`;
}

function render() {
  const prioRank = { high: 0, medium: 1, low: 2 };
  ORDER.forEach((status) => {
    const list = document.querySelector(`[data-list="${status}"]`);
    const items = tasks
      .filter((t) => t.status === status)
      .sort((a, b) => prioRank[a.prio] - prioRank[b.prio] || (a.due || "9999").localeCompare(b.due || "9999"));
    list.innerHTML = items.length ? items.map(cardHtml).join("") : `<li class="placeholder">Drop tasks here</li>`;
    document.querySelector(`[data-count="${status}"]`).textContent = items.length;
  });

  const done = tasks.filter((t) => t.status === "done").length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  document.getElementById("progressText").textContent = `${pct}% done · ${done} of ${tasks.length} tasks`;
  document.getElementById("progressBar").style.width = pct + "%";
}

function moveTask(id, status) {
  const t = tasks.find((x) => x.id === id);
  if (!t || t.status === status) return;
  t.status = status;
  save();
  render();
}

// ---------- Add ----------
document.getElementById("addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = document.getElementById("taskInput");
  const title = input.value.trim();
  if (!title) return;
  tasks.push({
    id: uid(),
    title,
    prio: document.getElementById("prioInput").value,
    due: document.getElementById("dueInput").value,
    status: "todo",
  });
  save();
  render();
  e.target.reset();
  document.getElementById("prioInput").value = "medium";
  input.focus();
});

// ---------- Card buttons ----------
document.querySelector(".board").addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.dataset.id;
  if (e.target.dataset.move) {
    const t = tasks.find((x) => x.id === id);
    const next = ORDER[ORDER.indexOf(t.status) + Number(e.target.dataset.move)];
    if (next) moveTask(id, next);
  } else if ("del" in e.target.dataset) {
    tasks = tasks.filter((x) => x.id !== id);
    save();
    render();
  }
});

document.getElementById("clearDone").addEventListener("click", () => {
  const n = tasks.filter((t) => t.status === "done").length;
  if (!n || !confirm(`Remove ${n} completed task${n === 1 ? "" : "s"}?`)) return;
  tasks = tasks.filter((t) => t.status !== "done");
  save();
  render();
});

// ---------- Drag and drop ----------
let dragId = null;
document.addEventListener("dragstart", (e) => {
  const card = e.target.closest && e.target.closest(".card");
  if (!card) return;
  dragId = card.dataset.id;
  card.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", dragId);
});
document.addEventListener("dragend", (e) => {
  const card = e.target.closest && e.target.closest(".card");
  if (card) card.classList.remove("dragging");
  document.querySelectorAll(".col.over").forEach((c) => c.classList.remove("over"));
  dragId = null;
});
document.querySelectorAll(".col").forEach((col) => {
  col.addEventListener("dragover", (e) => {
    if (!dragId) return;
    e.preventDefault();
    col.classList.add("over");
  });
  col.addEventListener("dragleave", (e) => {
    if (!col.contains(e.relatedTarget)) col.classList.remove("over");
  });
  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.classList.remove("over");
    if (dragId) moveTask(dragId, col.dataset.status);
  });
});

render();
