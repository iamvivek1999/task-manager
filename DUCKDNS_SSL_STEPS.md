# 🔐 SSL / HTTPS Setup with DuckDNS + Certbot

Domain: **`vivekapp.duckdns.org`**  
EC2 IPs: `hello-1` → `3.110.147.76` | `hello-2` → `13.201.94.125`

---

## Step 0 — Point DuckDNS to your ALB or EC2

1. Go to [https://www.duckdns.org](https://www.duckdns.org) and log in.
2. Find the subdomain `vivekapp` and update its **Current IP** to:
   - Your **EC2 hello-1 public IP**: `3.110.147.76`  
   *(Certbot must be run per-server. Later you can point it to the ALB if you attach an ACM cert there.)*

---

## Step 1 — SSH into `hello-1`

```bash
ssh -i "D:\TY\CC SEM6\SCE\helloworld.pem" ubuntu@3.110.147.76
```

---

## Step 2 — Deploy the new `nginx.conf` to `hello-1`

Copy the updated config from this repo to the server:

```bash
# Run from your LOCAL machine (Git Bash / WSL / PowerShell with SCP)
scp -i "D:\TY\CC SEM6\SCE\helloworld.pem" nginx.conf ubuntu@3.110.147.76:/tmp/nginx-task-manager.conf

# Then on the server:
sudo cp /tmp/nginx-task-manager.conf /etc/nginx/sites-available/task-manager
sudo nginx -t   # Verify config syntax
```

---

## Step 3 — Install Certbot on `hello-1`

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

---

## Step 4 — Run Certbot on `hello-1`

> ⚠️ DuckDNS must point to this server's IP **before** running this.

```bash
sudo certbot --nginx -d vivekapp.duckdns.org
```

Answer the prompts:
- **Email:** your email
- **Terms of Service:** `Y`
- **EFF mailing list:** `N`

Certbot will auto-configure Nginx and write the SSL cert to:
- `/etc/letsencrypt/live/vivekapp.duckdns.org/fullchain.pem`
- `/etc/letsencrypt/live/vivekapp.duckdns.org/privkey.pem`

---

## Step 5 — Reload Nginx on `hello-1`

```bash
sudo nginx -t && sudo systemctl reload nginx
```

✅ Visit **[https://vivekapp.duckdns.org](https://vivekapp.duckdns.org)** — you should see the green padlock 🔒

---

## Step 6 — Repeat everything on `hello-2`

```bash
# 1. Point DuckDNS to hello-2's IP: 13.201.94.125 (temporarily)
# 2. SSH in:
ssh -i "D:\TY\CC SEM6\SCE\helloworld.pem" ubuntu@13.201.94.125

# 3. SCP config:
scp -i "D:\TY\CC SEM6\SCE\helloworld.pem" nginx.conf ubuntu@13.201.94.125:/tmp/nginx-task-manager.conf

# 4. On hello-2:
sudo cp /tmp/nginx-task-manager.conf /etc/nginx/sites-available/task-manager
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d vivekapp.duckdns.org
sudo nginx -t && sudo systemctl reload nginx
```

---

## Step 7 — Set DuckDNS back to `hello-1` (or ALB)

After both certs are issued, point DuckDNS back to `hello-1`'s IP.  
(ALB doesn't support Certbot directly — for ALB HTTPS you need ACM, which requires a registered domain.)

---

## Auto-Renewal

Certbot creates a systemd timer that auto-renews certs. Verify it:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

---

## Summary

| Step | Action |
|------|--------|
| 0 | Point DuckDNS `vivekapp` → EC2 IP |
| 1–5 | Install certbot + get cert on `hello-1` |
| 6 | Repeat on `hello-2` (point DuckDNS there temporarily) |
| 7 | Point DuckDNS back to `hello-1` |
| Done | `https://vivekapp.duckdns.org` is live 🔒 |
