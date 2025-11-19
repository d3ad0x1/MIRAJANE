import { useTheme } from "../../hooks/useTheme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center gap-1 rounded-full bg-slate-800/80 border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      <span
        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
          isDark ? "bg-slate-950" : "bg-yellow-300 text-slate-900"
        }`}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
      <span className="hidden sm:inline">
        {isDark ? "Dark" : "Light"}
      </span>
    </button>
  );
}
