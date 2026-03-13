/**
 * Task Manager API — server.js
 * Cloud Computing Assignment
 *
 * Endpoints:
 *   GET    /health          → Load balancer health check
 *   GET    /tasks           → List all tasks
 *   POST   /tasks           → Create a new task
 *   PUT    /tasks/:id       → Update a task (toggle done / edit title)
 *   DELETE /tasks/:id       → Delete a task
 */

const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const TASKS_FILE = path.join(__dirname, "tasks.json");

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Request Logger ──────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const now = new Date().toISOString();
  console.log(`[${now}] ${req.method} ${req.url}`);
  next();
});

// ─── Persistence Helpers ─────────────────────────────────────────────────────
function loadTasks() {
  if (!fs.existsSync(TASKS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), "utf-8");
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health check — used by AWS Load Balancer
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime().toFixed(2) + "s",
    timestamp: new Date().toISOString(),
    server: require("os").hostname(),
  });
});

// GET all tasks
app.get("/tasks", (req, res) => {
  const tasks = loadTasks();
  res.json({ success: true, count: tasks.length, tasks });
});

// POST create task
app.post("/tasks", (req, res) => {
  const { title, priority } = req.body;
  if (!title || title.trim() === "") {
    return res.status(400).json({ success: false, error: "Title is required" });
  }
  const tasks = loadTasks();
  const newTask = {
    id: uuidv4(),
    title: title.trim(),
    priority: priority || "medium", // low | medium | high
    done: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  saveTasks(tasks);
  res.status(201).json({ success: true, task: newTask });
});

// PUT update task (toggle done or update title/priority)
app.put("/tasks/:id", (req, res) => {
  const tasks = loadTasks();
  const idx = tasks.findIndex((t) => t.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  const { title, done, priority } = req.body;
  if (title !== undefined) tasks[idx].title = title.trim();
  if (done !== undefined) tasks[idx].done = Boolean(done);
  if (priority !== undefined) tasks[idx].priority = priority;
  tasks[idx].updatedAt = new Date().toISOString();
  saveTasks(tasks);
  res.json({ success: true, task: tasks[idx] });
});

// DELETE a task
app.delete("/tasks/:id", (req, res) => {
  let tasks = loadTasks();
  const len = tasks.length;
  tasks = tasks.filter((t) => t.id !== req.params.id);
  if (tasks.length === len) {
    return res.status(404).json({ success: false, error: "Task not found" });
  }
  saveTasks(tasks);
  res.json({ success: true, message: "Task deleted" });
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Task Manager API running on port ${PORT}`);
  console.log(`   ➜ Local:    http://localhost:${PORT}`);
  console.log(`   ➜ Health:   http://localhost:${PORT}/health`);
  console.log(`   ➜ Tasks:    http://localhost:${PORT}/tasks\n`);
});
