/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // пусть будет, вдруг захочешь потом светлую тему
  theme: {
    extend: {
      colors: {
        mira: {
          bg: "#040716",         // общий фон
          panel: "#070B1F",      // панели / карточки
          border: "#14192D",     // бордеры
          neon: "#24D5FF",       // основной неоновый акцент
          accent: "#8B5CFF",     // фиолетовый акцент
          accent2: "#FF4D9A",    // розовый штрих, если понадобится
          textPrimary: "#E5F2FF",
          textSecondary: "#8A9BC9",
          danger: "#FF5573",
        },
      },
      boxShadow: {
        "mira-neon": "0 0 20px rgba(36, 213, 255, 0.4)",
        "mira-neon-soft": "0 0 40px rgba(139, 92, 255, 0.25)",
      },
    },
  },
  plugins: [],
};
