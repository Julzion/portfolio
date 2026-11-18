// ClientDesk: client records & policy renewal manager
// Data is stored in localStorage so it stays after a page refresh.

const KEY = "clientdesk.clients";
const DUE_DAYS = 30;

const $ = (id) => document.getElementById(id);
const rows = $("rows");
const dialog = $("dialog");
const form = $("form");

// ---------- Storage ----------
function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(saved)) return saved;
  } catch (e) { /* ignore and fall back to sample data */ }
  return sampleData();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(clients)); } catch (e) { /* storage unavailable */ }
}

// Fictional sample records so the demo isn't empty on first visit
function sampleData() {
  const d = (offset) => {
    const t = new Date();
    t.setDate(t.getDate() + offset);
    return t.toISOString().slice(0, 10);
  };
  return [
    { id: uid(), name: "Maria Santos", type: "Life", policy: "LF-20481", contact: "0917 555 0142", renewal: d(120), notes: "Prefers SMS reminders" },
    { id: uid(), name: "Jose Dela Cruz", type: "Motor", policy: "MT-11873", contact: "0928 555 0199", renewal: d(12), notes: "Two vehicles" },
    { id: uid(), name: "Ana Reyes", type: "Health", policy: "HL-30922", contact: "0935 555 0110", renewal: d(-6), notes: "" },
    { id: uid(), name: "Paolo Garcia", type: "Property", policy: "PR-07715", contact: "0906 555 0177", renewal: d(240), notes: "House and lot" },
    { id: uid(), name: "Liza Mendoza", type: "Travel", policy: "TR-55210", contact: "0919 555 0163", renewal: d(25), notes: "Annual multi-trip" },
    { id: uid(), name: "Ramon Bautista", type: "Motor", policy: "MT-12044", contact: "0947 555 0128", renewal: d(-40), notes: "Follow up for renewal" },
  ];
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

let clients = load();

// ---------- Helpers ----------
function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target - today) / 86400000);
}
function statusOf(c) {
  const days = daysUntil(c.renewal);
  if (days < 0) return "expired";
  if (days <= DUE_DAYS) return "due";
  return "active";
}
const STATUS_TEXT = { active: "Active", due: "Due soon", expired: "Expired" };

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}
function dueText(c) {
  const days = daysUntil(c.renewal);
  if (days < 0) return `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue`;
  if (days === 0) return "Due today";
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2000);
}

// ---------- Render ----------
function render() {
  const q = $("search").value.trim().toLowerCase();
  const f = $("filter").value;

  const list = clients
    .filter((c) => f === "all" || statusOf(c) === f)
    .filter((c) => !q || [c.name, c.policy, c.contact, c.type].join(" ").toLowerCase().includes(q))
    .sort((a, b) => a.renewal.localeCompare(b.renewal));

  rows.innerHTML = list.map((c) => {
    const s = statusOf(c);
    return `<tr>
      <td><span class="c-name">${escapeHtml(c.name)}</span>${c.notes ? `<span class="c-sub">${escapeHtml(c.notes)}</span>` : ""}</td>
      <td data-label="Policy">${escapeHtml(c.type)}<span class="c-sub">${escapeHtml(c.policy)}</span></td>
      <td data-label="Contact">${escapeHtml(c.contact)}</td>
      <td data-label="Renewal">${formatDate(c.renewal)}<span class="c-sub">${dueText(c)}</span></td>
      <td data-label="Status"><span class="badge badge--${s}">${STATUS_TEXT[s]}</span></td>
      <td><div class="row-actions">
        <button class="icon-btn" data-edit="${c.id}" type="button">Edit</button>
        <button class="icon-btn icon-btn--del" data-del="${c.id}" type="button">Delete</button>
      </div></td>
    </tr>`;
  }).join("");

  $("empty").hidden = list.length > 0;

  const counts = { active: 0, due: 0, expired: 0 };
  clients.forEach((c) => counts[statusOf(c)]++);
  $("statTotal").textContent = clients.length;
  $("statActive").textContent = counts.active;
  $("statDue").textContent = counts.due;
  $("statExpired").textContent = counts.expired;
}

// ---------- Form ----------
function openForm(client) {
  form.reset();
  $("formError").textContent = "";
  $("dlgTitle").textContent = client ? "Edit client" : "New client";
  if (client) {
    Object.entries(client).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v; });
  } else {
    form.elements.id.value = "";
  }
  dialog.showModal();
  form.elements.name.focus();
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  Object.keys(data).forEach((k) => { data[k] = data[k].trim(); });

  // Validation
  if (!data.name || !data.type || !data.policy || !data.contact || !data.renewal) {
    $("formError").textContent = "Please fill in all required fields.";
    return;
  }
  if (!/^[0-9+\s()-]{7,20}$/.test(data.contact)) {
    $("formError").textContent = "Contact number can only contain digits, spaces, +, ( ) and -.";
    return;
  }
  const duplicate = clients.find((c) => c.policy.toLowerCase() === data.policy.toLowerCase() && c.id !== data.id);
  if (duplicate) {
    $("formError").textContent = `Policy no. ${data.policy} is already assigned to ${duplicate.name}.`;
    return;
  }

  if (data.id) {
    clients = clients.map((c) => (c.id === data.id ? data : c));
    toast("Client updated");
  } else {
    data.id = uid();
    clients.push(data);
    toast("Client added");
  }
  save();
  render();
  dialog.close();
});

// ---------- Events ----------
$("newBtn").addEventListener("click", () => openForm(null));
$("cancelBtn").addEventListener("click", () => dialog.close());
$("search").addEventListener("input", render);
$("filter").addEventListener("change", render);

rows.addEventListener("click", (e) => {
  const editId = e.target.dataset.edit;
  const delId = e.target.dataset.del;
  if (editId) openForm(clients.find((c) => c.id === editId));
  if (delId) {
    const c = clients.find((x) => x.id === delId);
    if (c && confirm(`Delete ${c.name}'s record?`)) {
      clients = clients.filter((x) => x.id !== delId);
      save();
      render();
      toast("Client deleted");
    }
  }
});

$("exportBtn").addEventListener("click", () => {
  const header = ["Name", "Policy type", "Policy no.", "Contact", "Renewal date", "Status", "Notes"];
  const quote = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [header.map(quote).join(",")].concat(
    clients.map((c) => [c.name, c.type, c.policy, c.contact, c.renewal, STATUS_TEXT[statusOf(c)], c.notes || ""].map(quote).join(","))
  );
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "clientdesk-records.csv";
  a.click();
  URL.revokeObjectURL(a.href);
  toast("CSV exported");
});

render();
