<p align="center">
  <img src="assets/mira-banner.jpg" alt="Mira Docker Control Panel Banner" width="100%">
</p>

# 🧩 Mira — Docker Control Panel  
Neon-themed, fast and modern container management UI.

---

# 🇬🇧 English

## 🚀 About Mira
**Mira is a modern web panel for managing Docker containers, networks, images, volumes, and templates.**  
The panel is built with React + Vite + Tailwind, and the backend runs on FastAPI (Python).

Key features:
- 🔥 Real-time container monitoring  
- 🌐 Create / delete Docker networks  
- 📦 Manage images  
- 🧱 Volume management  
- 📝 Quick container creation via templates  
- ✨ Neon / cyberpunk UI design

---

## 📸 Screenshots

### 🧱 Dashboard / Containers
<div align="center" style="padding: 10px; border-radius: 12px; background: #0d0d18; border: 2px solid rgba(99,102,241,0.6); box-shadow: 0 0 15px rgba(99,102,241,0.8); margin-bottom: 20px;">
  <img src="assets/screens/containers.png" alt="Containers page" style="width:100%; border-radius: 8px;">
</div>

### 📦 Images
<div align="center" style="padding: 10px; border-radius: 12px; background: #0d0d18; border: 2px solid rgba(139,92,246,0.6); box-shadow: 0 0 15px rgba(139,92,246,0.8); margin-bottom: 20px;">
  <img src="assets/screens/images.png" alt="Images page" style="width:100%; border-radius: 8px;">
</div>

### 🌐 Networks
<div align="center" style="padding: 10px; border-radius: 12px; background: #0d0d18; border: 2px solid rgba(56,189,248,0.6); box-shadow: 0 0 15px rgba(56,189,248,0.8); margin-bottom: 20px;">
  <img src="assets/screens/networks.png" alt="Networks page" style="width:100%; border-radius: 8px;">
</div>

### 📝 Templates
<div align="center" style="padding: 10px; border-radius: 12px; background: #0d0d18; border: 2px solid rgba(14,165,233,0.6); box-shadow: 0 0 15px rgba(14,165,233,0.8); margin-bottom: 20px;">
  <img src="assets/screens/templates.png" alt="Templates page" style="width:100%; border-radius: 8px;">
</div>

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/d3ad0x1/MIRAJANE.git
cd mirajane-mira-panel
```

### 2️⃣ Create the .env file

```bash
cp .env.example .env
```

Fill in the required parameters:

```bash
API_URL=http://YOUR_IP:YOUR_PORT/api/v1
```

### 3️⃣ Start using Docker

```bash
docker compose up -d --build
```

### 4️⃣ Run the frontend locally

```bash
cd frontend
npm install
npm run dev
```

### 🛠 Required software

- Docker + Docker Compose
- Node.js 18+
- Git

### 🧯 Troubleshooting

❗ API not responding or returns 500 error
- Check backend container logs:
```bash
docker compose logs api -f
```

❗ Frontend white screen

- Check frontend logs:
```bash
npm run dev
```
- The API_URL parameter in .env may be incorrect.

## 🗂 Project Structure

- frontend/ — Mira UI built with React + Vite.
Runs on port 5173 in development, and behind nginx in production.
- backend/ — FastAPI-based API for Docker management.
Main API service, exposed on port 8088 inside the container.
- mira-data/ — Persistent data storage for Mira:
templates, presets, user configurations.
It is recommended to include this directory in scheduled backups.
- assets/ — banners, logos, and UI images.
- docker-compose.yml — defines and orchestrates all Mira services.
- README.md, README_RU.md, README_EN.md — project documentation in different languages.

## 🔐 Security

Mira controls your Docker host, which means access to the panel = access to the entire server.

Recommended best practices:

- Do not expose Mira directly to the public Internet.
- Use:
    - VPN (WireGuard / OpenVPN / ZeroTier);
    - internal network (LAN);
    - SSH tunnels if needed.
- Place Mira behind a secure reverse proxy:
    - Nginx / Traefik / Caddy;
    - HTTPS + Basic Auth / tokens / SSO.
- Be extremely careful with /var/run/docker.sock:
if it is mounted into the container, anyone with access to Mira gets root-level control over Docker.

## 🛣 Roadmap

### ✅ Current status (v0.1 — Core UI)

- [x] Containers panel (start / stop / restart / remove)
- [x] View container status and basic stats
- [x] Docker images list, image removal
- [x] Network management (create / delete)
- [x] Volume management
- [x] Basic template support (run containers from presets)
- [x] Docker Compose orchestration (backend + frontend)
- [x] Neon / cyberpunk Mira UI

---

### 🔐 v0.2 — Authentication & Roles

- [ ] Built-in panel authentication (login/password)
- [ ] User roles:
  - [ ] `admin` — full access to Mira and Docker
  - [ ] `read-only` — view-only mode
- [ ] Operation restrictions (e.g. deny remove for read-only users)
- [ ] Option to delegate auth to reverse proxy (Basic Auth / SSO)

---

### 🧩 v0.3 — Templates & Presets

- [ ] Flexible deployment templates (docker run / docker compose)
- [ ] Preset gallery (ready-made stacks: nginx + php-fpm, db + app, etc.)
- [ ] Export / import templates (JSON/YAML)
- [ ] Store templates in `mira-data/` to simplify backup

---

### 📈 v0.4 — Monitoring & QoL

- [ ] Extended container metrics (CPU, RAM, disk I/O)
- [ ] Container logs with filtering and live tail
- [ ] Search & filters for containers / images / networks
- [ ] Dark / light theme switcher
- [ ] UI localization (RU / EN / UZ)

---

### 🚀 v0.5 — Integrations & Production

- [ ] Multiple Docker hosts support (multi-node / remote Docker API)
- [ ] Mira settings managed via UI (no manual .env editing)
- [ ] Backup/restore for Mira configuration
- [ ] Optional integration with external monitoring (Prometheus / Loki / Grafana)

---

> Roadmap is not set in stone — features may change as Mira evolves.  
> Feature requests and ideas are welcome via Issues / Pull requests.


📄 **License:** [MIT License](LICENSE)