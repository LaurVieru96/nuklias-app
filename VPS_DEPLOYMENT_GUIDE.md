# 🚀 Nuklias Backend - VPS Deployment Guide

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [DNS & Domain Configuration](#dns--domain-configuration)
3. [VPS Server Setup](#vps-server-setup)
4. [Docker Configuration](#docker-configuration)
5. [Nginx Reverse Proxy](#nginx-reverse-proxy)
6. [SSL/TLS Certificates](#ssltls-certificates)
7. [Security Configuration](#security-configuration)
8. [Maintenance & Operations](#maintenance--operations)
9. [Troubleshooting](#troubleshooting)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / BROWSERS                         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │         HTTPS (Port 443)                 │
        │  https://nukliasds.com (Frontend)        │
        │  https://api.nukliasds.com (Backend)     │
        └──────────┬───────────────────┬───────────┘
                   │                   │
                   ▼                   ▼
        ┌──────────────────┐  ┌──────────────────────┐
        │   NETLIFY CDN    │  │   VPS SERVER         │
        │   (Frontend)     │  │   145.239.93.13      │
        │                  │  │                      │
        │ - Static Files   │  │ ┌──────────────────┐ │
        │ - React SPA      │  │ │ NGINX (Port 443) │ │
        │ - Auto Deploy    │  │ │ Reverse Proxy    │ │
        └──────────────────┘  │ └────────┬─────────┘ │
                              │          │           │
                              │          ▼           │
                              │ ┌──────────────────┐ │
                              │ │ DOCKER CONTAINER │ │
                              │ │ (Port 5000)      │ │
                              │ │                  │ │
                              │ │ - Node.js 20     │ │
                              │ │ - Express API    │ │
                              │ │ - Auto-restart   │ │
                              │ └────────┬─────────┘ │
                              └──────────┼───────────┘
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │   NEON DATABASE      │
                              │   (PostgreSQL)       │
                              │   - Cloud Hosted     │
                              │   - SSL Connection   │
                              └──────────────────────┘
```

---

## 🌐 DNS & Domain Configuration

### Domain: `nukliasds.com`

**DNS Provider:** Netlify DNS  
**Nameservers:**
- `dns1.p03.nsone.net`
- `dns2.p03.nsone.net`
- `dns3.p03.nsone.net`
- `dns4.p03.nsone.net`

### DNS Records

| Type | Name | Value | Purpose |
|------|------|-------|---------|
| **NETLIFY** | `nukliasds.com` | `nuklias.netlify.app` | Frontend (Main domain) |
| **NETLIFY** | `www.nukliasds.com` | `nuklias.netlify.app` | Frontend (WWW redirect) |
| **A** | `api.nukliasds.com` | `145.239.93.13` | Backend API (VPS) |

### How DNS Was Configured

1. **Purchased domain** from registrar
2. **Changed nameservers** at registrar to Netlify DNS nameservers
3. **Added A Record** in Netlify DNS panel:
   - Name: `api`
   - Type: A
   - Value: `145.239.93.13` (VPS IP)
   - TTL: 3600

### Verify DNS Configuration

```bash
# From any computer
nslookup nukliasds.com
# Should return: 35.157.26.135, 63.176.8.218 (Netlify IPs)

nslookup api.nukliasds.com
# Should return: 145.239.93.13 (VPS IP)
```

---

## 🖥️ VPS Server Setup

### Server Details

- **Provider:** OVH
- **IP Address:** `145.239.93.13`
- **Hostname:** `vps-dbf09ba3.vps.ovh.net`
- **OS:** Ubuntu (latest)
- **User:** `roger`

### Installed Software

| Software | Version | Purpose |
|----------|---------|---------|
| Docker | 28.4.0 | Container runtime |
| Docker Compose | v2.39.2 | Multi-container orchestration |
| Nginx | 1.26.0 | Reverse proxy & web server |
| Certbot | 2.9.0 | SSL certificate management |

### Directory Structure

```
/srv/apps/api/nuklias-app/
├── server/                 # Backend source code
│   ├── index.ts           # Main Express server
│   ├── db/                # Database config & models
│   ├── routes/            # API routes
│   └── config/            # Passport, etc.
├── .env                   # Environment variables (NEVER commit!)
├── docker-compose.yml     # Docker orchestration
├── Dockerfile             # Container build instructions
├── package.json           # Node.js dependencies
└── node_modules/          # Installed packages (in container)
```

---

## 🐳 Docker Configuration

### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    container_name: nuklias_backend
    restart: always              # Auto-restart on crash or server reboot
    ports:
      - "5000:5000"              # Expose port 5000 (localhost only via Nginx)
    env_file:
      - .env                     # Load environment variables
    command: npm start           # Production command (tsx server/index.ts)
```

### Environment Variables (.env)

```bash
# CORS - Allowed frontend origins
CLIENT_URL=https://nukliasds.com,https://nuklias.netlify.app

# Environment
NODE_ENV=production

# Server port
PORT=5000

# Database driver (use standard pg driver, not Neon serverless)
FORCE_STANDARD_DRIVER=true

# Database connection (KEEP SECRET!)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Session secret (KEEP SECRET! - 32+ random characters)
SESSION_SECRET=your-super-secret-random-string-here
```

### Docker Commands

```bash
# Navigate to project directory
cd /srv/apps/api/nuklias-app

# Start containers (build if needed)
docker compose up -d --build

# Stop containers
docker compose down

# Restart containers
docker compose restart

# View running containers
docker ps

# View logs (live)
docker logs nuklias_backend -f

# View last 50 log lines
docker logs nuklias_backend --tail 50

# Execute command inside container
docker exec nuklias_backend <command>

# Rebuild and restart (after code changes)
git pull
docker compose down
docker compose up --build -d
```

### Why Docker?

- ✅ **Isolation:** App runs in its own environment
- ✅ **Consistency:** Same environment on dev and production
- ✅ **Auto-restart:** Container restarts automatically if it crashes
- ✅ **Easy updates:** Just rebuild and restart
- ✅ **Portability:** Can move to any server easily

---

## 🔄 Nginx Reverse Proxy

### What is Nginx Doing?

Nginx acts as a **reverse proxy** between the internet and your Docker container:

1. **Receives HTTPS requests** on port 443 (`https://api.nukliasds.com`)
2. **Terminates SSL** (decrypts HTTPS → HTTP)
3. **Forwards to Docker** on `http://localhost:5000`
4. **Returns response** to client (encrypts HTTP → HTTPS)

### Configuration File

**Location:** `/etc/nginx/sites-available/nuklias-api`

```nginx
server {
    server_name api.nukliasds.com;

    location / {
        # Forward all requests to Docker container
        proxy_pass http://localhost:5000;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Preserve original request headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Disable caching for API requests
        proxy_cache_bypass $http_upgrade;
    }

    # SSL Configuration (managed by Certbot)
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/api.nukliasds.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.nukliasds.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name api.nukliasds.com;
    
    # Redirect all HTTP to HTTPS
    if ($host = api.nukliasds.com) {
        return 301 https://$host$request_uri;
    }
    
    return 404;
}
```

### Nginx Commands

```bash
# Test configuration (ALWAYS run before restart!)
sudo nginx -t

# Reload configuration (no downtime)
sudo nginx -s reload

# Restart Nginx
sudo systemctl restart nginx

# View status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log

# Enable site configuration
sudo ln -s /etc/nginx/sites-available/nuklias-api /etc/nginx/sites-enabled/

# Disable site configuration
sudo rm /etc/nginx/sites-enabled/nuklias-api
```

---

## 🔒 SSL/TLS Certificates

### Certificate Details

- **Provider:** Let's Encrypt (FREE!)
- **Type:** ECDSA
- **Domain:** `api.nukliasds.com`
- **Expiry:** 90 days (auto-renews)
- **Next Renewal:** Before 2026-05-15

### Certificate Locations

```
/etc/letsencrypt/live/api.nukliasds.com/
├── fullchain.pem       # Public certificate + chain
├── privkey.pem         # Private key (KEEP SECRET!)
├── cert.pem            # Public certificate only
└── chain.pem           # Certificate chain
```

### How SSL Was Set Up

1. **Installed Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Obtained Certificate:**
   ```bash
   sudo certbot --nginx -d api.nukliasds.com
   ```

3. **Certbot automatically:**
   - Verified domain ownership (DNS challenge)
   - Generated SSL certificate
   - Modified Nginx configuration
   - Set up auto-renewal cron job

### Certificate Management

```bash
# View all certificates
sudo certbot certificates

# Renew certificates (dry run - test only)
sudo certbot renew --dry-run

# Force renew a specific certificate
sudo certbot renew --cert-name api.nukliasds.com

# Revoke certificate (if compromised)
sudo certbot revoke --cert-name api.nukliasds.com

# Delete certificate
sudo certbot delete --cert-name api.nukliasds.com
```

### Auto-Renewal

Certbot installs a **systemd timer** that checks for renewal twice daily.

```bash
# Check renewal timer status
sudo systemctl status certbot.timer

# View renewal logs
sudo journalctl -u certbot.renew.service
```

**Certificates auto-renew 30 days before expiry.** No manual action needed! ✅

---

## 🛡️ Security Configuration

### Firewall (UFW)

**Status:** Active

| Port | Protocol | Purpose | Status |
|------|----------|---------|--------|
| 22 | TCP | SSH (Server access) | ✅ ALLOW |
| 80 | TCP | HTTP (Redirects to HTTPS) | ✅ ALLOW |
| 443 | TCP | HTTPS (Nginx SSL) | ✅ ALLOW |
| 5000 | TCP | Docker (Backend API) | ⚠️ ALLOW (Should be DENY!) |
| 10000 | TCP | Webmin (Optional) | ✅ ALLOW |

### 🚨 Security Issue: Port 5000 is Exposed!

**Problem:** Port 5000 is accessible from the internet. This bypasses Nginx and SSL!

**Fix:**

```bash
# Remove port 5000 from firewall
sudo ufw delete allow 5000/tcp

# Reload firewall
sudo ufw reload

# Verify
sudo ufw status numbered
```

**After this, port 5000 will only be accessible via `localhost` (Nginx proxy).**

### Firewall Commands

```bash
# View firewall status
sudo ufw status verbose

# Allow a port
sudo ufw allow 443/tcp

# Deny a port
sudo ufw deny 5000/tcp

# Delete a rule by number
sudo ufw delete 3

# Enable firewall
sudo ufw enable

# Disable firewall (NOT recommended!)
sudo ufw disable

# Reset firewall (delete all rules)
sudo ufw reset
```

### SSH Security

**Current Configuration:**
```bash
# View SSH config
sudo cat /etc/ssh/sshd_config | grep -E "PermitRootLogin|PasswordAuthentication|Port"
```

**Recommended Settings:**
```
PermitRootLogin no                    # Disable root login
PasswordAuthentication no             # Use SSH keys only
Port 22                               # Default port (or custom for extra security)
```

**Apply changes:**
```bash
sudo systemctl restart sshd
```

### Fail2Ban (Brute Force Protection)

**Install:**
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

**Check status:**
```bash
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

Fail2Ban automatically bans IPs after multiple failed login attempts.

---

## 🔧 Maintenance & Operations

### Regular Updates

```bash
# Update package list
sudo apt update

# View available updates
sudo apt list --upgradable

# Install updates
sudo apt upgrade -y

# Reboot if kernel updated
sudo reboot
```

### Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check Docker resource usage
docker stats

# Check system logs
sudo journalctl -xe

# Check Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Strategy

**What to backup:**
1. ✅ **Code:** Already in Git (GitHub)
2. ✅ **Database:** Neon has automatic backups
3. ⚠️ **Environment variables:** `.env` file (backup manually!)
4. ⚠️ **Nginx config:** `/etc/nginx/sites-available/nuklias-api`
5. ⚠️ **SSL certificates:** Auto-renewed, but backup `/etc/letsencrypt/` just in case

**Backup .env file:**
```bash
# Copy to secure location (NOT in Git!)
cp /srv/apps/api/nuklias-app/.env ~/backups/env-backup-$(date +%Y%m%d).txt
```

### Deployment Workflow

**When you update code:**

1. **Push to GitHub** (from local PC):
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Pull on server** (SSH to VPS):
   ```bash
   cd /srv/apps/api/nuklias-app
   git pull
   ```

3. **Rebuild Docker** (if dependencies changed):
   ```bash
   docker compose down
   docker compose up --build -d
   ```

4. **Or just restart** (if only code changed):
   ```bash
   docker compose restart
   ```

5. **Verify:**
   ```bash
   docker logs nuklias_backend --tail 50
   curl https://api.nukliasds.com/api/health
   ```

---

## 🐛 Troubleshooting

### Problem: Site is down / 502 Bad Gateway

**Check if Docker is running:**
```bash
docker ps
```

**If container is not running:**
```bash
cd /srv/apps/api/nuklias-app
docker compose up -d
```

**Check logs:**
```bash
docker logs nuklias_backend --tail 100
```

---

### Problem: CORS errors in browser

**Check CORS configuration:**
```bash
docker logs nuklias_backend | grep CORS
```

Should show:
```
🔒 CORS Configured for: https://nukliasds.com, https://nuklias.netlify.app
```

**If wrong, update `.env`:**
```bash
nano /srv/apps/api/nuklias-app/.env
# Update CLIENT_URL
docker compose restart
```

---

### Problem: SSL certificate expired

**Check expiry:**
```bash
sudo certbot certificates
```

**Renew manually:**
```bash
sudo certbot renew
sudo nginx -s reload
```

---

### Problem: Can't SSH to server

**From local PC:**
```bash
ping 145.239.93.13
```

**If ping works but SSH doesn't:**
- Check if port 22 is open in firewall
- Check if SSH service is running (contact VPS provider)

---

### Problem: Database connection errors

**Check DATABASE_URL in .env:**
```bash
docker exec nuklias_backend printenv DATABASE_URL
```

**Test connection:**
```bash
docker exec nuklias_backend node -e "const {Pool}=require('pg');const pool=new Pool({connectionString:process.env.DATABASE_URL});pool.query('SELECT NOW()').then(r=>console.log('✅ DB OK:',r.rows[0])).catch(e=>console.error('❌ DB Error:',e.message));"
```

---

### Problem: Port 5000 not accessible

**This is CORRECT!** Port 5000 should only be accessible via Nginx (port 443).

**Test locally on server:**
```bash
curl http://localhost:5000/api/health
```

**Test via Nginx:**
```bash
curl https://api.nukliasds.com/api/health
```

---

### Useful Debug Commands

```bash
# Check all running processes
ps aux | grep node

# Check open ports
sudo netstat -tulpn | grep LISTEN

# Check DNS resolution
nslookup api.nukliasds.com

# Test SSL certificate
openssl s_client -connect api.nukliasds.com:443 -servername api.nukliasds.com

# Check Nginx configuration syntax
sudo nginx -t

# View real-time logs
docker logs nuklias_backend -f

# Restart everything
sudo systemctl restart nginx
docker compose restart
```

---

## 📞 Quick Reference

### Important URLs

| URL | Purpose |
|-----|---------|
| `https://nukliasds.com` | Frontend (Netlify) |
| `https://nuklias.netlify.app` | Frontend (Netlify subdomain) |
| `https://api.nukliasds.com` | Backend API (VPS) |
| `https://api.nukliasds.com/api/health` | Health check endpoint |

### Important Files

| File | Location | Purpose |
|------|----------|---------|
| `.env` | `/srv/apps/api/nuklias-app/.env` | Environment variables |
| `docker-compose.yml` | `/srv/apps/api/nuklias-app/docker-compose.yml` | Docker config |
| Nginx config | `/etc/nginx/sites-available/nuklias-api` | Reverse proxy config |
| SSL cert | `/etc/letsencrypt/live/api.nukliasds.com/` | SSL certificates |

### Emergency Contacts

- **VPS Provider:** OVH Support
- **Domain Registrar:** (Where you bought nukliasds.com)
- **DNS:** Netlify DNS
- **Database:** Neon (cloud-hosted PostgreSQL)

---

## ✅ Post-Deployment Checklist

- [x] DNS configured (A record for api.nukliasds.com)
- [x] Docker container running with `restart: always`
- [x] Nginx reverse proxy configured
- [x] SSL certificate installed and auto-renewing
- [x] Firewall configured (UFW)
- [ ] **TODO:** Close port 5000 in firewall
- [ ] **TODO:** Install Fail2Ban
- [ ] **TODO:** Set up automated backups for .env
- [x] CORS configured for both domains
- [x] Environment variables set correctly
- [x] Health check endpoint working

---

**Last Updated:** 2026-02-15  
**Maintained by:** Nuklias Team  
**Server IP:** 145.239.93.13  
**Domain:** nukliasds.com
