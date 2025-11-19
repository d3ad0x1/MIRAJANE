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

## 📦 Installation

### 1️⃣ Clone the repository
```bash
git clone https://github.com/d3ad0x1/mirajane-mira-panel.git
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