import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "./locales/en/common.json";
import ruCommon from "./locales/ru/common.json";

const savedLang = localStorage.getItem("mira_lang") || "ru";

i18n
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: "en",
    resources: {
      en: { common: enCommon },
      ru: { common: ruCommon },
    },
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("mira_lang", lng);
});

export default i18n;
