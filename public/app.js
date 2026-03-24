/**
 * TaskFlow — app.js
 * Frontend logic: CRUD via fetch API + Easter Egg (type "hello")
 */

// ─── State ───────────────────────────────────────────────────────────────────
let tasks = [];
let currentFilter = "all";

// ─── DOM References ───────────────────────────────────────────────────────────
const taskForm       = document.getElementById("task-form");
const taskInput      = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const taskList       = document.getElementById("task-list");
const emptyState     = document.getElementById("empty-state");
const taskCountBadge = document.getElementById("task-count-badge");
const healthDot      = document.getElementById("health-dot");
const toastEl        = document.getElementById("toast");
const filterBtns     = document.querySelectorAll(".filter-btn");
const clearDoneBtn   = document.getElementById("clear-done-btn");
const easterEgg      = document.getElementById("easter-egg");
const closeEasterBtn = document.getElementById("close-easter-egg");
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon      = document.getElementById("theme-icon");
const themeLabel     = document.getElementById("theme-label");

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeIcon.textContent  = dark ? "☀️" : "🌙";
  themeLabel.textContent = dark ? "Light" : "Dark";
  localStorage.setItem("taskflow-theme", dark ? "dark" : "light");
}

// Load saved preference (default: light)
applyTheme(localStorage.getItem("taskflow-theme") === "dark");
themeToggleBtn.addEventListener("click", () => {
  applyTheme(!document.body.classList.contains("dark"));
});

// ─── API Helpers ──────────────────────────────────────────────────────────────
const API = "/tasks";

async function apiGet()             { return fetch(API).then(r => r.json()); }
async function apiPost(data)        { return fetch(API, { method: "POST",   headers: {"Content-Type": "application/json"}, body: JSON.stringify(data) }).then(r => r.json()); }
async function apiPut(id, data)     { return fetch(`${API}/${id}`, { method: "PUT",    headers: {"Content-Type": "application/json"}, body: JSON.stringify(data) }).then(r => r.json()); }
async function apiDelete(id)        { return fetch(`${API}/${id}`, { method: "DELETE" }).then(r => r.json()); }

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(msg, duration = 2500) {
  toastEl.textContent = msg;
  toastEl.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add("hidden"), duration);
}

// ─── Render ───────────────────────────────────────────────────────────────────
function priorityLabel(p) {
  return { high: "🔴 High", medium: "🟡 Medium", low: "🟢 Low" }[p] || p;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function renderTasks() {
  const filtered = tasks.filter(t => {
    if (currentFilter === "pending") return !t.done;
    if (currentFilter === "done")    return t.done;
    return true;
  });

  taskList.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
    filtered.forEach(task => {
      const card = document.createElement("div");
      card.className = `task-card ${task.done ? "done" : ""}`;
      card.dataset.priority = task.priority;
      card.dataset.id = task.id;
      card.innerHTML = `
        <div class="task-checkbox ${task.done ? "checked" : ""}" 
             role="checkbox" aria-checked="${task.done}" 
             tabindex="0" title="Toggle done" 
             id="check-${task.id}">
          ${task.done ? "✓" : ""}
        </div>
        <div class="task-info">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">${priorityLabel(task.priority)} · ${formatDate(task.createdAt)}</div>
        </div>
        <div class="task-actions">
          <button class="btn btn-icon" title="Delete task" id="del-${task.id}">🗑</button>
        </div>
      `;

      // Toggle done
      card.querySelector(`#check-${task.id}`).addEventListener("click", () => toggleDone(task.id, !task.done));
      // Delete
      card.querySelector(`#del-${task.id}`).addEventListener("click", () => deleteTask(task.id));

      taskList.appendChild(card);
    });
  }

  // Update badge
  const total   = tasks.length;
  const pending = tasks.filter(t => !t.done).length;
  taskCountBadge.textContent = `${pending} pending / ${total} total`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── CRUD Actions ─────────────────────────────────────────────────────────────
async function loadTasks() {
  try {
    const res = await apiGet();
    if (res.success) { tasks = res.tasks; renderTasks(); }
  } catch {
    showToast("⚠️ Could not reach server");
  }
}

async function addTask(e) {
  e.preventDefault();
  const title    = taskInput.value.trim();
  const priority = prioritySelect.value;
  if (!title) return;

  taskInput.disabled = true;
  const res = await apiPost({ title, priority });
  taskInput.disabled = false;

  if (res.success) {
    tasks.push(res.task);
    renderTasks();
    taskInput.value = "";
    taskInput.focus();
    showToast("✅ Task added!");
  } else {
    showToast("❌ " + (res.error || "Failed to add task"));
  }
}

async function toggleDone(id, done) {
  const res = await apiPut(id, { done });
  if (res.success) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx !== -1) tasks[idx] = res.task;
    renderTasks();
    showToast(done ? "✅ Marked as done!" : "🔄 Marked as pending");
  }
}

async function deleteTask(id) {
  const res = await apiDelete(id);
  if (res.success) {
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    showToast("🗑 Task deleted");
  }
}

async function clearDone() {
  const doneTasks = tasks.filter(t => t.done);
  await Promise.all(doneTasks.map(t => apiDelete(t.id)));
  tasks = tasks.filter(t => !t.done);
  renderTasks();
  if (doneTasks.length) showToast(`🧹 Cleared ${doneTasks.length} done task(s)`);
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ─── Health Check ─────────────────────────────────────────────────────────────
async function checkHealth() {
  try {
    const res = await fetch("/health").then(r => r.json());
    if (res.status === "ok") {
      healthDot.classList.add("online");
      healthDot.classList.remove("offline");
      healthDot.title = `Server online · uptime ${res.uptime}`;
    }
  } catch {
    healthDot.classList.add("offline");
    healthDot.classList.remove("online");
    healthDot.title = "Server offline";
  }
}

// ─── 🥚 EASTER EGG — Typing "hello" triggers Hello World overlay ──────────────
(function setupEasterEgg() {
  const SECRET = "hello";
  let buffer = "";
  let bufferTimer;

  document.addEventListener("keydown", (e) => {
    // Skip if user is typing inside an input/textarea/select
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;

    // Only accept printable single characters
    if (e.key.length !== 1) return;

    buffer += e.key.toLowerCase();

    // Keep buffer trimmed to the length of the secret
    if (buffer.length > SECRET.length) {
      buffer = buffer.slice(buffer.length - SECRET.length);
    }

    // Reset buffer after 2 seconds of inactivity
    clearTimeout(bufferTimer);
    bufferTimer = setTimeout(() => { buffer = ""; }, 2000);

    // Check for match
    if (buffer === SECRET) {
      buffer = "";
      openEasterEgg();
    }
  });

  function openEasterEgg() {
    easterEgg.classList.remove("hidden");
    startParticles();
    closeEasterBtn.focus();
  }

  function closeEasterEgg() {
    easterEgg.classList.add("hidden");
    stopParticles();
  }

  closeEasterBtn.addEventListener("click", closeEasterEgg);
  easterEgg.addEventListener("click", (e) => {
    if (e.target === easterEgg) closeEasterEgg();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeEasterEgg();
  });
})();

// ─── Particle Canvas (Easter Egg) ─────────────────────────────────────────────
let animFrame;
let particles = [];

function startParticles() {
  const canvas = document.getElementById("particle-canvas");
  const ctx    = canvas.getContext("2d");

  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  particles = Array.from({ length: 80 }, () => ({
    x:    Math.random() * canvas.width,
    y:    Math.random() * canvas.height,
    r:    Math.random() * 3 + 1,
    dx:   (Math.random() - 0.5) * 1.2,
    dy:   (Math.random() - 0.5) * 1.2,
    hue:  Math.random() * 60 + 250,  // purples
    alpha: Math.random() * 0.6 + 0.2,
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha})`;
      ctx.fill();
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height)  p.dy *= -1;
    });
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function stopParticles() {
  cancelAnimationFrame(animFrame);
  const canvas = document.getElementById("particle-canvas");
  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

// ─── Event Bindings ───────────────────────────────────────────────────────────
taskForm.addEventListener("submit", addTask);
clearDoneBtn.addEventListener("click", clearDone);

// ─── Init ─────────────────────────────────────────────────────────────────────
loadTasks();
checkHealth();
setInterval(checkHealth, 30000); // health check every 30s
