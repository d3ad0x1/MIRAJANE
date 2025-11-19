<p align="center">
  <img src="assets/mira-banner.jpg" alt="Mira Docker Control Panel Banner" width="100%">
</p>

# 🧩 Mira — Docker Control Panel  
Neon-themed, fast and modern container management UI.

---

# 🇺🇿 O‘zbekcha

## 🚀 Mira haqida
**Mira — bu Docker konteynerlari, tarmoqlar, obrazlar, volumelar va shablonlarni boshqarish uchun zamonaviy veb-panel.**  
Panel React + Vite + Tailwind asosida qurilgan, backend esa FastAPI (Python).

Kuchli tomonlari:
- 🔥 Real vaqtli konteyner monitoringi  
- 🌐 Tarmoqlarni yaratish / o‘chirish  
- 📦 Obrazlar bilan ishlash  
- 🧱 Volume boshqaruvi  
- 📝 Shablonlar orqali tez konteyner yaratish  
- ✨ Neon / cyberpunk UI

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

## 📦 O‘rnatish

### 1️⃣ Repozitoriyani klonlash
```bash
git clone https://github.com/d3ad0x1/MIRAJANE.git
cd mirajane-mira-panel
```

### 2️⃣.env faylini yaratish

```bash
cp .env.example .env
```

Keyingi parametrlarni to‘ldiring:

```bash
API_URL=http://Sening IP manziling:porting/api/v1
```

### 3️⃣ Docker orqali ishga tushirish

```bash
docker compose up -d --build
```

### 4️⃣ Frontendni ishga tushirish (lokal)

```bash
cd frontend
npm install
npm run dev
```

### 🛠 Kerakli dasturlar

- Docker + Docker Compose
- Node.js 18+
- Git

### 🧯 Muammolarni bartaraf qilish

❗ API ishdan chiqdi yoki 500 xatolik
- Backend konteynerini tekshiring:
```bash
docker compose logs api -f
```

❗ Frontend oq ekran

- Frontend logini ko‘ring:
```bash
npm run dev
```
- API_URL noto‘g‘ri bo‘lishi mumkin.

## 🗂 Loyihaning tuzilishi

- frontend/ — React + Vite asosidagi Mira interfeysi.
Dev rejimida 5173-port orqali ishlaydi, prod rejimida esa nginx orqali xizmat qiladi.
- backend/ — Docker boshqaruvi uchun FastAPI API xizmati.
Asosiy API-servis, konteyner ichidagi port — 8088.
- mira-data/ — Mira uchun doimiy ma’lumotlar katalogi:
shablonlar, presetlar, foydalanuvchi sozlamalari.
Ushbu katalogni muntazam backupga qo‘shish tavsiya etiladi.
- assets/ — bannerlar, logotiplar va UI tasvirlari.
- docker-compose.yml — Mira xizmatlarini orkestratsiya qilish fayli.
- README.md, README_RU.md, README_EN.md — loyiha hujjatlari.

## 🔐 Xavfsizlik

Mira Docker-hostni boshqaradi, demak panelga kirish = serverga to‘liq kirish degani.

Tavsiya etiladi:

- Mirani internetga ochiq holda qo‘ymaslik.
- Foydalanish:
    - VPN (WireGuard / OpenVPN / ZeroTier);
    - ichki tarmoq (LAN);
    - zarurat bo‘lsa SSH tunnel.
- Panelni reverse-proxy orqali ishga tushirish:
    - Nginx / Traefik / Caddy;
    - HTTPS + Basic Auth / tokenlar / SSO.
- /var/run/docker.sock bilan ehtiyotkor bo‘lish:
agar u konteynerga ulangan bo‘lsa, panelga kirgan har qanday foydalanuvchi Dockerga to‘liq root darajasida egalik qiladi.

## 🛣 Roadmap (yo‘l xaritasi)

### ✅ Joriy holat (v0.1 — Core UI)

- [x] Konteynerlar paneli (start / stop / restart / remove)
- [x] Konteyner holati va asosiy statistikani ko‘rish
- [x] Docker imijlar ro‘yxati, imijlarni o‘chirish
- [x] Tarmoqlarni boshqarish (yaratish / o‘chirish)
- [x] Volumelarni boshqarish
- [x] Shablonlar asosida konteynerlarni yaratish (presets)
- [x] Docker Compose orkestratsiyasi (backend + frontend)
- [x] Neon / cyberpunk uslubidagi Mira UI

---

### 🔐 v0.2 — Avtorizatsiya va rollar

- [ ] Panel ichida avtorizatsiya (login/parol)
- [ ] Foydalanuvchi rollari:
  - [ ] `admin` — Mira va Docker bo‘yicha to‘liq huquqlarga ega
  - [ ] `read-only` — faqat ko‘rish rejimi
- [ ] Amallarni cheklash (masalan, read-only uchun konteyner/imij o‘chirishni bloklash)
- [ ] Avtorizatsiyani nginx/traefik orqali tashqariga chiqarish imkoniyati (Basic Auth / SSO)

---

### 🧩 v0.3 — Shablonlar va presetlar

- [ ] Moslashuvchan shablonlar (docker run / docker compose)
- [ ] Tayyor presetlar galereyasi (nginx + php-fpm, db + app va boshqalar)
- [ ] Shablonlarni eksport/import qilish (JSON/YAML)
- [ ] Shablonlarni `mira-data/` katalogiga bog‘lash (qulay backup uchun)

---

### 📈 v0.4 — Monitoring va qulayliklar (QoL)

- [ ] Batafsil konteyner statistikasi (CPU, RAM, disk yuklanishi)
- [ ] Konteyner loglari (filtrlash + live-update)
- [ ] Qidiruv va filtrlar (konteynerlar / imijlar / tarmoqlar bo‘yicha)
- [ ] Yorug‘ / qorong‘i tema (theme switcher)
- [ ] UI lokalizatsiyasi (RU / EN / UZ)

---

### 🚀 v0.5 — Integratsiyalar va prodakshn

- [ ] Bir nechta Docker-hostlarni qo‘llab-quvvatlash (multi-node / remote Docker API)
- [ ] Mira sozlamalarini UI orqali boshqarish (.env tahririsiz)
- [ ] Mira konfiguratsiyasining backup/restore funksiyasi
- [ ] Tashqi monitoring tizimlari bilan integratsiya (Prometheus / Loki / Grafana — imkoniyatga qarab)

---

> Roadmap yakuniy emas — Mira rivojlanishi jarayonida o‘zgarishi mumkin. 
> Takliflar va g‘oyalarni Issues yoki Pull requests orqali yuborish mumkin.


📄 **License:** [MIT License](LICENSE)