# 🔐 SSL / HTTPS Setup — DuckDNS + Certbot

**Domain:** `vivekapp.duckdns.org`  
**Servers:** `hello-1` → `3.110.147.76` | `hello-2` → `13.201.94.125`

> ⚠️ **Order matters.** DNS must resolve first → then deploy nginx → then run Certbot.

---

## Step 0 — Register DuckDNS Domain (do this first, in browser)

1. Go to 👉 [https://www.duckdns.org](https://www.duckdns.org) and log in
2. Add subdomain `vivekapp` (or update existing)
3. Set IP to **`3.110.147.76`** (hello-1's public IP)
4. Click **"update ip"**

Verify DNS resolves (run locally or on server):
```bash
nslookup vivekapp.duckdns.org
# Must return: 3.110.147.76
```

---

## Step 1 — SSH into `hello-1`

```bash
ssh -i "D:\TY\CC SEM6\SCE\helloworld.pem" ubuntu@3.110.147.76
```

---

## Step 2 — Deploy updated nginx config

```bash
cd ~/task-manager
git pull
sudo cp nginx.conf /etc/nginx/sites-available/task-manager
sudo nginx -t && sudo systemctl reload nginx
```

✅ Expected: `nginx: configuration file /etc/nginx/nginx.conf test is successful`

---

## Step 3 — Run Certbot

```bash
sudo certbot --nginx -d vivekapp.duckdns.org
```

Answer prompts:
- **Email:** your email
- **Terms of Service:** `Y`
- **EFF mailing list:** `N`

Certbot will:
1. Verify domain ownership via HTTP challenge
2. Issue the Let's Encrypt certificate
3. **Automatically update your nginx config** to add HTTPS + redirect

✅ Expected: `Successfully deployed certificate for vivekapp.duckdns.org`

---

## Step 4 — Verify

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Visit 👉 **[https://vivekapp.duckdns.org](https://vivekapp.duckdns.org)** — should show green padlock 🔒

---

## Step 5 — Repeat on `hello-2`

```bash
# 1. In browser: change DuckDNS IP to 13.201.94.125, click Update IP
# 2. Wait ~1 min, verify: nslookup vivekapp.duckdns.org → 13.201.94.125

# 3. SSH into hello-2:
ssh -i "D:\TY\CC SEM6\SCE\helloworld.pem" ubuntu@13.201.94.125

# 4. On hello-2:
cd ~/task-manager
git pull
sudo cp nginx.conf /etc/nginx/sites-available/task-manager
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d vivekapp.duckdns.org
```

---

## Step 6 — Point DuckDNS back to `hello-1`

After both certs are issued, set DuckDNS IP back to **`3.110.147.76`**.

---

## Auto-Renewal Check

```bash
sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

---

## Summary

| Step | Action |
|------|--------|
| 0 | Register DuckDNS `vivekapp` → `3.110.147.76` |
| 1–4 | Deploy HTTP nginx config → run Certbot on `hello-1` |
| 5 | Switch DuckDNS to `hello-2` IP → repeat |
| 6 | Switch DuckDNS back to `hello-1` |
| ✅ | `https://vivekapp.duckdns.org` live with green padlock |
