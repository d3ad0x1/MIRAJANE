import { useAuth } from "../../hooks/useAuth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../../hooks/useTheme";

export default function Header() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <header
      className={
        "h-14 border-b flex items-center justify-between px-4 backdrop-blur-md " +
        (isDark
          ? "border-mira-border bg-slate-950/80"
          : "border-slate-200 bg-white/80")
      }
    >
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-[0.2em] text-mira-neon drop-shadow-[0_0_12px_rgba(56,232,255,0.8)] uppercase">
            Mira
          </span>
          <span className="h-6 w-px bg-mira-border/70" />
        </div>
        <div className="text-xs md:text-sm font-medium text-mira-textSecondary">
          <span className="text-mira-textSecondary/80">
            {t("header.breadcrumbPrefix", "Section")}
          </span>{" "}
          <span className="text-mira-textPrimary">
            {t("header.breadcrumb", { section: t("nav.dashboard") })}
          </span>
        </div>
      </div>

      {/* Right: controls */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="hidden sm:block text-[11px] text-mira-textSecondary">
          {user
            ? t("header.signedInAs", { username: user.username })
            : t("header.notSignedIn")}
        </div>
      </div>
    </header>
  );
}
