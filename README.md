# ⚡ TaskFlow — Task Manager API

> A production-grade REST API and dashboard built with **Node.js + Express**, deployed on **AWS EC2** with **Nginx**, **Let's Encrypt SSL**, and **GitHub Actions CI/CD**.  
> **Cloud Computing Subject Assignment**

🌐 **Live URL:** `https://yourname.signiance.com`

---

## 🏗️ Architecture

```
         Internet
             │
     ┌───────▼────────┐
     │  AWS ALB        │  (Application Load Balancer)
     │  yourname.      │  Health check: /health
     │  signiance.com  │
     └───┬────────┬───┘
         │        │
   ┌─────▼──┐ ┌───▼─────┐
   │ EC2 #1 │ │  EC2 #2 │   Ubuntu 22.04
   │ Nginx  │ │  Nginx  │   Port 80/443
   │ :443   │ │  :443   │
   └─────┬──┘ └───┬─────┘
         │        │
   ┌─────▼──┐ ┌───▼─────┐
   │Node.js │ │ Node.js │   PM2 process manager
   │  :3000 │ │  :3000  │   Auto-restart on crash
   └────────┘ └─────────┘

CI/CD: GitHub push → GitHub Actions → SSH → git pull → PM2 restart
```

---

## 🚀 Features

| Feature | Details |
|---------|---------|
| REST API | CRUD for tasks (`GET`, `POST`, `PUT`, `DELETE`) |
| Health Check | `GET /health` — used by AWS Load Balancer |
| File Persistence | Tasks saved to `tasks.json` (survives restarts) |
| Premium UI | Glassmorphism dashboard, light/dark theme toggle |
| Priority Levels | 🔴 High · 🟡 Medium · 🟢 Low |
| Filter Tabs | All / Pending / Done |
| 🌍 Default Landing | **Hello World** page with animated particle canvas |
| 🥚 Easter Egg — TaskFlow | Type `task` anywhere (or click the badge) to open the Task Manager |
| 🥚 Easter Egg — Hello | Type `hello` anywhere to return to the Hello World screen |
| Load Balancing | AWS ALB across 2 EC2 instances |
| SSL | Let's Encrypt via Certbot |
| CI/CD | GitHub Actions — deploys on every `git push` |

---

## 🥚 Hidden Navigation (Easter Eggs)

The app **opens on the Hello World screen** by default — a full-screen animated particle canvas.

### Toggle to TaskFlow (Task Manager)

> Type `t → a → s → k` anywhere on the page *(not inside an input box)*,
> **or click the glowing badge** on the Hello World screen.

### Return to Hello World

> Type `h → e → l → l → o` anywhere on the page *(not inside an input box)*.

Both sequences must be typed within **2 seconds** of each other. The buffer resets on inactivity.

---

## 📡 API Reference

**Base URL:** `https://yourname.signiance.com`

### GET `/health`
```json
{
  "status": "ok",
  "uptime": "3600.12s",
  "timestamp": "2026-03-13T18:00:00Z",
  "server": "ip-10-0-0-1"
}
```

### GET `/tasks`
```json
{ "success": true, "count": 2, "tasks": [...] }
```

### POST `/tasks`
```json
// Request body:
{ "title": "Deploy to EC2", "priority": "high" }

// Response:
{ "success": true, "task": { "id": "uuid", "title": "...", "done": false, ... } }
```

### PUT `/tasks/:id`
```json
// Toggle done:
{ "done": true }
// Update title:
{ "title": "New title", "priority": "low" }
```

### DELETE `/tasks/:id`
```json
{ "success": true, "message": "Task deleted" }
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18 |
| Framework | Express 4 |
| Process Manager | PM2 |
| Web Server | Nginx (reverse proxy) |
| SSL | Let's Encrypt / Certbot |
| Cloud | AWS EC2 (Ubuntu 22.04) |
| Load Balancer | AWS ALB |
| Version Control | Git + GitHub |
| CI/CD | GitHub Actions |

---

## ⚙️ Local Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/task-manager.git
cd task-manager

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev      # uses nodemon (auto-reload)
# or
npm start        # plain node

# 4. Open browser
# http://localhost:3000
```

---

## ☁️ AWS EC2 Deployment (Manual — One-Time Setup)

### Step 1 — Launch EC2 Instances

1. AWS Console → EC2 → **Launch Instance**
2. **AMI:**Amazon Linux Server 22.04 LTS
3. **Instance type:** t3.micro (free tier)
4. **Security Group:** allow SSH (22), HTTP (80), HTTPS (443), port 3000
5. Download `.pem` key pair
6. Repeat for **EC2 Instance 2**

### Step 2 — Install Node.js, PM2, Nginx

```bash
# SSH into each instance
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>

# Update packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2
pm2 startup   # follow the printed command to enable on boot

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
```

### Step 3 — Clone & Start App

```bash
cd /home/ubuntu
git clone https://github.com/yourusername/task-manager.git
cd task-manager
npm install --production
pm2 start ecosystem.config.js
pm2 save
```

### Step 4 — Configure Nginx

```bash
sudo cp nginx.conf /etc/nginx/sites-available/task-manager
sudo ln -s /etc/nginx/sites-available/task-manager /etc/nginx/sites-enabled/
sudo nginx -t          # test config
sudo systemctl reload nginx
```

### Step 5 — SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx

# Share your EC2 Elastic IP with professor → he maps yourname.signiance.com
# Once DNS propagates:
sudo certbot --nginx -d yourname.signiance.com

# Auto-renewal (runs twice daily):
sudo systemctl enable certbot.timer
```

### Step 6 — AWS Application Load Balancer

1. EC2 Console → **Load Balancers** → Create Application Load Balancer
2. **Listeners:** HTTP (80) → redirect to HTTPS; HTTPS (443) → Target Group
3. **Target Group:** Register both EC2 instances, health check path `/health`
4. **NOTE:** If one server crashes, ALB automatically routes to the healthy instance

---

## 🔄 CI/CD Pipeline (GitHub Actions)

### Setup Secrets (GitHub → Repo → Settings → Secrets)

| Secret | Value |
|--------|-------|
| `EC2_HOST_1` | Public IP of EC2 Instance 1 |
| `EC2_HOST_2` | Public IP of EC2 Instance 2 |
| `EC2_SSH_KEY` | Contents of your `.pem` private key |

### How it works

```
git push origin main
        │
        ▼
GitHub Actions triggered
        │
        ├── npm install (validate)
        │
        ├── SSH → EC2 #1 → git pull → npm install → pm2 restart
        │
        ├── SSH → EC2 #2 → git pull → npm install → pm2 restart
        │
        └── curl /health → confirm deployment ✅
```

**Result:** Every `git push` deploys to both servers. Changes live on `yourname.signiance.com` within ~30 seconds.

---

## 📂 Project Structure

```
task-manager/
├── server.js               # Express REST API
├── package.json
├── ecosystem.config.js     # PM2 config
├── nginx.conf              # Nginx reverse proxy
├── .gitignore
├── public/
│   ├── index.html          # Dashboard UI
│   ├── styles.css          # Dark-mode premium CSS
│   └── app.js              # Frontend JS + Easter Eggs 🥚 (type 'task'/'hello', click badge)
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Actions CI/CD
```

---

## 📚 Learnings

| Topic | What I Learned |
|-------|----------------|
| **AWS EC2** | Launching Ubuntu instances, security groups, elastic IPs, SSH access |
| **Nginx** | Reverse proxy, HTTP→HTTPS redirect, upstream blocks, gzip, SSL termination |
| **Let's Encrypt** | Certbot auto-certificate issuance and renewal via ACME protocol |
| **PM2** | Process management, auto-restart on crash, startup scripts, log management |
| **Load Balancing** | AWS ALB health checks, target groups, automatic failover between instances |
| **GitHub Actions** | SSH-based deployment, secrets management, multi-server deploy pipelines |
| **REST API Design** | CRUD endpoints, status codes, JSON responses, error handling |
| **Security** | HTTPS, HTTP headers (HSTS, X-Frame-Options), CORS, SSL hardening |

---

*Built for Cloud Computing subject — demonstrating real-world infrastructure with Node.js, AWS, Nginx, SSL, and GitHub Actions CI/CD.*
