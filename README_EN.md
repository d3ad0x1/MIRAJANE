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
<p align="center">
  <img src="assets/screens/containers.png" width="100%" alt="Containers page">
</p>

### 📦 Images
<p align="center">
  <img src="assets/screens/images.png" width="100%" alt="Docker Images page">
</p>

### 🌐 Networks
<p align="center">
  <img src="assets/screens/networks.png" width="100%" alt="Docker Networks">
</p>

### 📝 Templates
<p align="center">
  <img src="assets/screens/templates.png" width="100%" alt="Templates UI">
</p>

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

📄 **License:** [MIT License](LICENSE)