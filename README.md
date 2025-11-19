# 🧩 Mira — Docker Control Panel  
Neon-themed, fast and modern container management UI.

---

# 🇺🇿 O‘zbekcha (Latin)

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

## 📦 O‘rnatish

### 1️⃣ Repozitoriyani klonlash
```bash
git clone https://github.com/YOURNAME/mirajane-mira-panel.git
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