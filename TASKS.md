# 📋 Project Tasks — TaskFlow (Cloud Computing Assignment)

---

## ✅ Done

- **A.** Create a HelloWorld app in Node.js and push the code on GitHub
  - Node.js + Express app built (`server.js`)
  - Hello World is the default landing page
  - Code pushed to `github.com/iamvivek1999/task-manager`

- **B.** Setup secure infrastructure on AWS and host the app *(partial)*
  - 2 EC2 instances launched: `hello-1` (`3.110.147.76`) and `hello-2` (`13.201.94.125`)
  - Node.js, PM2, Nginx installed and configured on both
  - App running on both EC2s (port 3000 + Nginx on port 80)
  - ALB (`taskflow-alb`) created with both instances as targets
  - App accessible via ALB on HTTP ✅
- **C.** Setup Nginx to serve the application on port 80
  - Nginx installed on both EC2 instances
  - Configured as reverse proxy: port 80 → Node.js port 3000
  - Config at `/etc/nginx/sites-available/task-manager` on both instances
  - App accessible via `http://<EC2_IP>` and via ALB on port 80

- **E.** CI/CD pipeline using GitHub Actions
  - `.github/workflows/deploy.yml` created
  - Triggers on every `git push` to `main`
  - SSH deploys to both EC2s: `git pull` → `npm install` → `pm2 restart`
  - Health check after deploy
  - ⚠️ Needs GitHub Secrets added: `EC2_HOST_1`, `EC2_HOST_2`, `EC2_SSH_KEY`

---

## ⏳ Pending

- **B/D.** SSL / HTTPS + Domain setup
  - Share ALB DNS with professor during review → he maps `vivek.signiance.com`
  - Then run on both EC2s: `sudo certbot --nginx -d vivek.signiance.com`
  - `nginx.conf` already has SSL config ready for `vivek.signiance.com`
