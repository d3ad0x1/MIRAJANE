import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";

const languages = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const current = i18n.language.startsWith("ru") ? "ru" : "en";

  return (
    <div
      className={
        "inline-flex items-center rounded-full border p-0.5 text-xs transition-colors " +
        (isDark
          ? "bg-slate-950/80 border-mira-border shadow-[0_0_18px_rgba(15,23,42,0.8)]"
          : "bg-slate-100 border-slate-300")
      }
    >
      {languages.map((lang) => {
        const active = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={
              "px-3 py-1 rounded-full font-medium transition-colors " +
              (isDark
                ? active
                  ? "bg-mira-neon text-slate-950 shadow-mira-neon"
                  : "text-mira-textSecondary hover:text-mira-textPrimary hover:bg-slate-900/80"
                : active
                ? "bg-mira-neon text-slate-950 shadow-sm"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-200")
            }
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}
