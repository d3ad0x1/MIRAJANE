import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../hooks/useTheme";

const base =
  "block px-4 py-2 rounded-lg text-sm font-medium transition-colors";

export default function Sidebar() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const linkClass = (isActive: boolean) => {
    if (isDark) {
      return [
        base,
        isActive
          ? "bg-mira-neon text-slate-950 shadow-mira-neon"
          : "text-mira-textSecondary hover:bg-slate-900/70 hover:text-mira-textPrimary",
      ].join(" ");
    }

    return [
      base,
      isActive
        ? "bg-mira-neon text-slate-950"
        : "text-slate-700 hover:bg-slate-200/80",
    ].join(" ");
  };

  return (
    <aside
      className={
        "w-64 border-r flex flex-col " +
        (isDark
          ? "bg-slate-950/90 border-mira-border"
          : "bg-white border-slate-200")
      }
    >
      {/* Brand */}
      <div className="px-4 py-4 border-b border-mira-border/60">
        <div className="text-lg font-bold text-mira-textPrimary flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-mira-neon to-mira-accent text-[11px] font-black text-slate-950 shadow-mira-neon">
            M
          </span>
          <span>Mira</span>
        </div>
        <div className="text-[11px] text-mira-textSecondary mt-1">
          Docker Control Panel
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 text-sm">
        <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
          {t("nav.dashboard")}
        </NavLink>
        <NavLink
          to="/containers"
          className={({ isActive }) => linkClass(isActive)}
        >
          {t("nav.containers")}
        </NavLink>
        <NavLink
          to="/images"
          className={({ isActive }) => linkClass(isActive)}
        >
          {t("nav.images")}
        </NavLink>
        <NavLink
          to="/volumes"
          className={({ isActive }) => linkClass(isActive)}
        >
          {t("nav.volumes")}
        </NavLink>
        <NavLink
          to="/templates"
          className={({ isActive }) => linkClass(isActive)}
        >
          {t("nav.templates")}
        </NavLink>
        <NavLink
          to="/networks"
          className={({ isActive }) => linkClass(isActive)}
        >
          {t("nav.networks")}
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-mira-border/60 text-[11px] text-mira-textSecondary">
        Mirajane · {new Date().getFullYear()}
      </div>
    </aside>
  );
}
